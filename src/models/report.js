import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    machine : {
        type :mongoose.Schema.Types.ObjectId,
        ref : "Machine",
        required : true
    },
    reportedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    description : {
        type : String,
        required : true,
        trim : true
    },
    status : {
        type : String,
        enum : ["open", "in_progress", "resolved"],
        required : true
    },
    resolvedAt : {
        type : Date,
        default : null
    },
    }, {timestamps : true}
)

const Report = mongoose.model("report", reportSchema);

export default Report;