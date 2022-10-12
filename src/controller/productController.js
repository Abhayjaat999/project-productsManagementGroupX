const productModel = require("../models/productModel");
const valid = require("../validator/validator");
const jwt = require("jsonwebtoken");
const { uploadFile } = require("../controller/awsController");

var nameRegex = /^[a-zA-Z\s]*$/
var priceRegex = /^[1-9]\d*(\.\d+)?$/
var installmentRegex = /\d/

const createProduct = async (req, res) => {
    try {
        let data = req.body;
    let {title,description,price,currencyId,currencyFormat,availableSizes,style,installments,isFreeShipping}=data
      if(Object.keys(data).length===0){
        return res.status(400).send({status:false,msg:"Request body is empty"})
      }
      let objectCreate = {}

 let requiredField=["title","description","price","currencyId","currencyFormat"]
 for(field of requiredField){
    if(!data[field]){
        return res.status(400).send({status:false,msg:`${field} is not present in request body`})
    }
    
 }

 if(!valid.isValid(title))
    return res.status(400).send({status:false,msg:"title is invalid"})
    objectCreate.title = title
 

 if(!valid.isValid(description))
    return res.status(400).send({status:false,msg:"description is invalid"})
    objectCreate.description = description
 
 
 if (priceRegex.test(price) == false) return res.status(400).send({ status: false, message: "you entered a invalid price" })
 objectCreate.price = price
 
 if(!valid.isValid(currencyId)){
    return res.status(400).send({status:false,msg:"currencyId is invalid"})
 }
 if(!valid.isValid(currencyFormat)){
    return res.status(400).send({status:false,msg:"currencyFormat is invalid"})
 }
 if(currencyId !== "INR")   
    return res.status(400).send({status:false,msg:"currencyId format is wrong"})
    objectCreate.currencyId = currencyId
 
 let titleVerify= await productModel.findOne({title:title})
    if(titleVerify){
        return res.status(400).send({status:false,msg:"title is already present"})
    }
//    currencyFormat
    let checkCurrencyFormat = "₹"
    if (currencyFormat != checkCurrencyFormat)return res.status(400).send({ status: false, message: "you entered a invalid currencyFormat--> currencyFormat should be ₹" })
    objectCreate.currencyFormat = currencyFormat

    //image
    let image = req.files
    if (!image || image.length == 0)return res.status(400).send({ status: false, message: "Profile Image field is Required" })
    let productImage = await uploadFile(image[0])
    objectCreate.productImage = productImage

    //style (if it is present)
    if (style) {
        if (nameRegex.test(style) == false) return res.status(400).send({ status: false, message: "STyle to enterd is invalid" })
        objectCreate.style = style
    }
    
    //avalableSizes
    
    if (!availableSizes)return res.status(400).send({ status: false, message: "Available Sizes field is Required" })
     
    let checkSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
    let arrayOfSizes = availableSizes.trim().split(" ")

        for (let i = 0; i < arrayOfSizes.length; i++) {
            if (checkSizes.includes(arrayOfSizes[i].trim())) continue;
            else return res.status(400).send({ status: false, message: "Sizes should in this ENUM only S/XS/M/X/L/XXL/XL" })
        }
        

        let newSize = []
        for (let j = 0; j < arrayOfSizes.length; j++) {
            if (newSize.includes(arrayOfSizes[j].trim())) continue;
            else newSize.push(arrayOfSizes[j].trim())
        }

        objectCreate.availableSizes = newSize

        // installment (if given)
        if (installments || installments==="") {
            if(!installments) return res.status(400).send({ status: false, message: "Installment is empty" })
            if (installmentRegex.test(installments) == false) return res.status(400).send({ status: false, message: "Installment  you entered is invalid" })
            objectCreate.installments = installments
        }
//---------------------------------------------------------------------------------------
        let productCreate = await productModel.create(objectCreate)
        return res.status(201).send({ status: true, message: "Document is created successfully", data: productCreate })

    } catch (error) {
        res.status(500).send({ status: false, err: error.message });
    }
}

const getProduct = async (req, res) => {
    try {
        let filter={isDeleted:false}
        if(req.query.size){
            if(valid.isValid(req.query.size)||valid.isValidSize(req.query.size)){
                filter.size=req.query.size
                console.log(filter)
            }
        }







    }
    catch (error) {
        res.status(500).send({ status: false, err: error.message });
    }







}




module.exports = { createProduct,getProduct };