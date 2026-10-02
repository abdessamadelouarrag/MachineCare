import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    machine : {
        type :mongoose.Schema.Types.ObjectId,
        ref : "machines",
        required : true
    },
    reportedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
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
        default : "open",
        required : true
    },
    resolutionNote : {
        type : String,
        trim : true,
        default : "",
        required : function(){ return this.status === "resolved" }
    },
    resolvedAt : {
        type : Date,
        default : null
    },
    }, {timestamps : true, optimisticConcurrency : true}
)

const Report = mongoose.model("report", reportSchema);

export default Report;
