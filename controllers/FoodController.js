import foodModel from "../models/foodmodels.js";
import fs from 'fs'

//add food item
const addFood = async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image uploaded" });
  }

  let image_filename = req.file.filename;
  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename,
  });

  try {
    await food.save();
    res.json({ success: true, message: "Food Added", data: food });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
}
const listFood=async (req,res)=>{
         try{
               const foods= await foodModel.find({});
               res.json({success:true,data:foods})
         }
         catch(error){
                     console.log(error);
                     res.json({success:false,message:"Error"})
         }
}
//remove food item
const removeFood= async(req,res)=>
{ try{
       const food= await foodModel.findById(req.body.id);
       fs.unlink(`uploads/${food.image}`,()=>{})

       await foodModel.findByIdAndDelete(req.body.id);
       res.json({success:true,message:"food removed"})

}
catch(error){
    res.json({success:false,message:"Error"})

}

}



export {addFood,listFood,removeFood}