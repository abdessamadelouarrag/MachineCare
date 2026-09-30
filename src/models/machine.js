import mongoose from "mongoose";

const machineSchema = new mongoose.Schema({
    reference : {
        type : String,
        trim : true,
        required : true,
        unique : true
    },
    name : {
        type : String,
        trim : true,
        required : true
    },
    workshop : {
        type : String,
        trim : true,
        required : true
    },
    status : {
        type: String,
        enum: ["available", "maintenance", "out_of_service"],
        default: "available",
        required: true
    }
}, 
    {timestamps : true}
)

const Machine = mongoose.model("machines", machineSchema);

export default Machine;