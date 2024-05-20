const mongoose=require("mongoose")

let userSchema=new mongoose.Schema({
    // _id:String,
    name: String,
    email:String,
    password:String
})


let User=new mongoose.model("User",userSchema)

module.exports=User
