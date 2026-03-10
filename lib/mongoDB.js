import mongoose from 'mongoose'

const { Schema, connect, model: _model } = mongoose
const defaultOptions = { useNewUrlParser: true, useUnifiedTopology: true }

export class mongoDB {
  constructor(url, options = defaultOptions) {
    this.url = url
    this.options = options
    this.data = this._data = {}
    this._schema = {}
    this._model = {}
    this.db = connect(this.url, { ...this.options }).catch(console.error)
  }
  async read() {
    this.conn = await this.db
    const schema = this._schema = new Schema({
      data: {
        type: Object,
        required: true,
        default: {}
      }
    })
    try {
      this._model = _model('data', schema)
    } catch {
      this._model = _model('data')
    }
    this._data = await this._model.findOne({})
    if (!this._data) {
      this.data = {}
      // Crear documento inicial
      await this._model.create({ data: this.data })
      this._data = await this._model.findOne({})
    } else {
      this.data = this._data.data || {}
    }
    return this.data
  }

  write(data) {
    return new Promise(async (resolve, reject) => {
      try {
        if (data === undefined || data === null) return reject(new Error('No data provided'))
        if (!this._data) {
          const doc = new this._model({ data })
          return resolve(await doc.save())
        }
        const doc = await this._model.findById(this._data._id)
        if (!doc) {
          const newDoc = new this._model({ data })
          await newDoc.save()
          this._data = newDoc
          this.data = data
          return resolve(newDoc)
        }
        doc.data = data
        await doc.save()
        this.data = data
        return resolve(doc)
      } catch (err) {
        return reject(err)
      }
    })
  }
}

export const mongoDBV2 = class MongoDBV2 {
  constructor(url, options = defaultOptions) {
    this.url = url
    this.options = options
    this.models = []
    this.data = {}
    this.lists = null
    this.list = null
    this.db = connect(this.url, { ...this.options }).catch(console.error)
  }
  async read() {
    this.conn = await this.db
    const schema = new Schema({
      data: [{
        name: String,
      }]
    })
    try {
      this.list = _model('lists', schema)
    } catch (e) {
      this.list = _model('lists')
    }
    this.lists = await this.list.findOne({})
    if (!this.lists || !this.lists.data) {
      await this.list.create({ data: [] })
      this.lists = await this.list.findOne({})
    }
    let garbage = []
    for (let { name } of (this.lists.data || [])) {
      let collection
      try {
        collection = _model(name, new Schema({ data: Array }))
      } catch (e) {
        try { collection = _model(name) } catch (e2) {
          garbage.push(name)
          console.error(e2)
        }
      }
      if (collection) {
        this.models.push({ name, model: collection })
        const collectionsData = await collection.find({})
        this.data[name] = Object.fromEntries((collectionsData || []).map(v => [v._id.toString(), v.data]))
      }
    }
    try {
      const del = await this.list.findById(this.lists._id)
      if (del) {
        del.data = del.data.filter(v => !garbage.includes(v.name))
        await del.save()
      }
    } catch (e) {
      console.error(e)
    }

    return this.data
  }
  write(data) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.lists || !data) return reject(new Error('lists or data missing'))
        const collections = Object.keys(data)
        let listDoc = []
        for (let key of collections) {
          const index = this.models.findIndex(v => v.name === key)
          let docModel
          if (index !== -1) {
            docModel = this.models[index].model
            await docModel.deleteMany().catch(console.error)
            if (Object.keys(data[key]).length) {
              await docModel.insertMany(Object.entries(data[key]).map(([k, v]) => ({ data: v })))
            }
            listDoc.push({ name: key })
          } else {
            const schema = new Schema({ data: Array })
            try {
              docModel = _model(key, schema)
            } catch (e) {
              docModel = _model(key)
            }
            this.models.push({ name: key, model: docModel })
            if (Object.keys(data[key]).length) {
              await docModel.insertMany(Object.entries(data[key]).map(([k, v]) => ({ data: v })))
            }
            listDoc.push({ name: key })
          }
        }

        // save list
        const listDocObj = await this.list.findById(this.lists._id)
        if (!listDocObj) return resolve(false)
        listDocObj.data = listDoc
        await listDocObj.save()
        this.data = {}
        return resolve(true)
      } catch (err) {
        return reject(err)
      }
    })
  }
}
