const mongoose=require("mongoose")

let blogSchema=new mongoose.Schema({
    // _id:Number,
    title: String,
    description: String,
    author:String,
})


let Blog=new mongoose.model("Blog", blogSchema)

module.exports=Blog