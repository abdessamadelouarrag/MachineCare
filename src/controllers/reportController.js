import mongoose from "mongoose";
import Report from "../models/report.js";
import Machine from "../models/machine.js";

export async function createReport(req, res, next){
    try{
        const {reference, description, status} = req.body || {};
        if(typeof reference !== "string" || !reference.trim()){
            return res.status(400).json({
                message_error : "Reference machine obligatoire !"
            })
        }
        if(typeof description !== "string" || !description.trim()){
            return res.status(400).json({
                message_error : "Description obligatoire !"
            })
        }
        if(status !== undefined && status !== "open"){
            return res.status(400).json({
                message_error : "Une nouvelle panne doit etre ouverte !"
            })
        }
        const findMachine = await Machine.findOne({reference : reference.trim()});
        if(!findMachine){
            return res.status(404).json({
                message_error : "Machine introuvable !"
            })
        }
        const report = await Report.create({
            machine : findMachine._id,
            description : description.trim(),
            reportedBy : req.user._id,
            status : "open"
        });
        return res.status(201).json({
            message : "Panne declaree.",
            report : report
        });
    }catch(error){
        next(error);
    }
}

export async function getReports(req, res, next){
    try{
        const {reference, status} = req.query;
        const filter = {};
        if(reference !== undefined){
            if(typeof reference !== "string" || !reference.trim()){
                return res.status(400).json({
                    message_error : "Reference machine invalide !"
                })
            }
            const findMachine = await Machine.findOne({reference : reference.trim()});
            if(!findMachine){
                return res.status(404).json({
                    message_error : "Machine introuvable !"
                })
            }
            filter.machine = findMachine._id;
        }
        if(status !== undefined){
            if(status !== "open" && status !== "in_progress" && status !== "resolved"){
                return res.status(400).json({
                    message_error : "Statut de panne invalide !"
                })
            }
            filter.status = status;
        }
        const reports = await Report.find(filter)
            .populate("machine").populate("reportedBy", "name email").sort({createdAt : -1});
        return res.status(200).json({
            total_reports : reports.length,
            reports : reports
        });
    }catch(error){
        next(error);
    }
}

export async function getReport(req, res, next){
    try{
        if(!mongoose.isObjectIdOrHexString(req.params.id)){
            return res.status(400).json({
                message_error : "Identifiant signalement invalide !"
            })
        }
        const report = await Report.findById(req.params.id)
            .populate("machine").populate("reportedBy", "name email");
        if(!report){
            return res.status(404).json({
                message_error : "Signalement introuvable !"
            })
        }
        return res.status(200).json({
            report : report
        });
    }catch(error){
        next(error);
    }
}

