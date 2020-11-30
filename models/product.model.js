module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      name: { 
        type: String, 
        required: true,
        minlength: 3,
        maxlength: 100 
      },
      image: {
        type: String,
        required: true,
        minlength: 10,
      },
      price: {
        type: Number,
        required: true,
        minlength: 0
      },
      date: { type: Date, default: Date.now }
    }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Product = mongoose.model("product", schema);
  return Product;
};