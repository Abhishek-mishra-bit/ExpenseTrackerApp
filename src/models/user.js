const mongoose = require("mongoose");


const userSchema =new mongoose.Schema({
 
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  email:{
          type:String,
          minlength:5,
          validate: {
            validator: function (v) {
              return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
          },
          required:true,
          unique:true,
        },
  password:{
           type:String,
            required:true,
            minLength:6
        },
  isPremiumUser: {
    type:Boolean,
    required:true,
    default:false
  },
  totalExpenses: {
    type: Number,
    default: 0,
  },
  
});

const User = mongoose.model("User", userSchema);
module.exports = User;
