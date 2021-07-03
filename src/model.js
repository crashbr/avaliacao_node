import mongoose from 'mongoose';

const { Schema } = mongoose;

const schemaEmpresa = new Schema({
  empresa: String,
  site: String,
});

export default mongoose.model('Empresa', schemaEmpresa);
