import Machine from "../models/machine.js";
import Report from "../models/report.js";

export async function getMachines(req, res, next){
    try{
        const {workshop, status} = req.query;
        const filter = {};
        if(workshop !== undefined){
            if(typeof workshop !== "string" || !workshop.trim()){
                return res.status(400).json({
                    message_error : "Atelier invalide !"
                })
            }
            filter.workshop = workshop.trim();
        }
        if(status !== undefined){
            if(status !== "available" && status !== "maintenance" && status !== "out_of_service"){
                return res.status(400).json({
                    message_error : "Etat de machine invalide !"
                })
            }
            filter.status = status;
        }
        const machines = await Machine.find(filter);
        return res.status(200).json({
            total_machines : machines.length,
            machines : machines
        });
    }catch(error){
        next(error);
    }
}

export async function createMachine(req, res, next){
    try{
        const {reference, name, workshop, status = "available"} = req.body || {};
        if(typeof reference !== "string" || !reference.trim()){
            return res.status(400).json({
                message_error : "Reference obligatoire !"
            })
        }
        if(typeof name !== "string" || !name.trim()){
            return res.status(400).json({
                message_error : "Nom obligatoire !"
            })
        }
        if(typeof workshop !== "string" || !workshop.trim()){
            return res.status(400).json({
                message_error : "Reference, nom et atelier obligatoires !"
            })
        }
        if(status !== "available" && status !== "maintenance" && status !== "out_of_service"){
            return res.status(400).json({
                message_error : "Etat de machine invalide !"
            })
        }
        const findMachine = await Machine.findOne({reference : reference.trim()});
        if(findMachine){
            return res.status(409).json({
                message_error : "Reference deja utilise !"
            })
        }
        const machine = await Machine.create({
            reference : reference.trim(),
            name : name.trim(),
            workshop : workshop.trim(),
            status : status
        });
        return res.status(201).json({
            message : "Machine creee.",
            info_machine : machine
        })
    }catch(error){
        next(error);
    }
}

export async function getMachine(req, res, next){
    try{
        const machine = await Machine.findOne({reference : req.params.reference});
        if(!machine){
            return res.status(404).json({
                message_error : "Machine introuvable !"
            })
        }
        return res.status(200).json({
            machine : machine
        });
    }catch(error){
        next(error);
    }
}

export async function updateMachine(req, res, next){
    try{
        const machine = await Machine.findOne({reference : req.params.reference});
        if(!machine){
            return res.status(404).json({
                message_error : "Machine introuvable !"
            })
        }
        const {reference, name, workshop, status} = req.body || {};
        if(reference === undefined && name === undefined && workshop === undefined && status === undefined){
            return res.status(400).json({
                message_error : "Aucun champ a modifier !"
            })
        }
        if(reference !== undefined && (typeof reference !== "string" || !reference.trim())){
            return res.status(400).json({
                message_error : "Reference invalide !"
            })
        }
        if(name !== undefined && (typeof name !== "string" || !name.trim())){
            return res.status(400).json({
                message_error : "Nom invalide !"
            })
        }
        if(workshop !== undefined && (typeof workshop !== "string" || !workshop.trim())){
            return res.status(400).json({
                message_error : "Atelier invalide !"
            })
        }
        if(status !== undefined && status !== "available" && status !== "maintenance" && status !== "out_of_service"){
            return res.status(400).json({
                message_error : "Etat de machine invalide !"
            })
        }
        if(reference !== undefined){
            const findMachine = await Machine.findOne({
                reference : reference.trim(),
                _id : {$ne : machine._id}
            });
            if(findMachine){
                return res.status(409).json({
                    message_error : "Reference deja utilise !"
                })
            }
            machine.reference = reference.trim();
        }
        if(name !== undefined){
            machine.name = name.trim();
        }
        if(workshop !== undefined){
            machine.workshop = workshop.trim();
        }
        if(status !== undefined){
            machine.status = status;
        }
        await machine.save();
        return res.status(200).json({
            message : "Machine modifiee.",
            machine : machine
        });
    }catch(error){
        next(error);
    }
}

export async function machineHistory(req, res, next){
    try{
        const machine = await Machine.findOne({reference : req.params.reference});
        if(!machine){
            return res.status(404).json({
                message_error : "Machine introuvable !"
            })
        }
        const reports = await Report.find({machine : machine._id})
            .populate("reportedBy", "name email").sort({createdAt : -1});
        return res.status(200).json({
            machine : machine,
            reports : reports
        });
    }catch(error){
        next(error);
    }
}

export async function deleteMahchine(req, res, next){
    try{
        const machine = await Machine.findOne({reference : req.params.reference});
        if(!machine){
            return res.status(404).json({
                message_error : "Machine introuvable !"
            })
        }
        // conserver l'historique des signalements
        const findReport = await Report.exists({machine : machine._id});
        if(findReport){
            return res.status(409).json({
                message_error : "Suppression impossible : cette machine a des signalements !"
            })
        }
        await Machine.deleteOne({_id : machine._id});
        return res.status(200).json({
            message : "Machine supprimee.",
            machines_deleted : {
                reference : machine.reference
            }
        })
    }catch(error){
        next(error);
    }
}

export async function allMachines(req, res, next){
    return getMachines(req, res, next);
}
