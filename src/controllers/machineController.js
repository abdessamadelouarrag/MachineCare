import Machine from "../models/machine.js";

export async function getMachines(req, res, next){
    try{
        const machines = await Machine.find();
        return res.status(200).json({machines});
    }catch(error){
        next(error);
    }
}

export async function createMachine(req, res, next){
    try{
        const {reference, name, workshop, status} = req.body;

        if(!reference || !name || !workshop || !status){
            return res.status(400).json({
                messege_error : "obligation de tout les chemps !"
            })
        }
        //validation reference
        const regeX = /^[A-Z]$/;

        if (!regeX.test(reference[0]) || reference.length !== 4) {
            return res.status(404).json({
                message_error: "incorrect exemple : M443"
            });
        }

        const findMachine = await Machine.findOne({reference : reference})
        if(findMachine){
            return res.status(400).json({
                message_error : "deja une machine avec reference ! "
            })
        }

        const createMachine = await Machine.create({
            reference : reference,
            name : name,
            workshop : workshop,
            status : status
        })

        return res.status(201).json({
            message : "tu a creer la machine bien ...",
            info_machine : {reference : reference, name : name, workshop : workshop}
        })
    }catch(error){
        next(error);
    }

}


export async function allMachines(req, res) {

    const machines = await Machine.find();
    const totalMachine = machines.length;
    
    return res.status(200).json({
        total_machines : totalMachine,
        machines : machines.map(machine => ({
            id : machine._id,
            reference : machine.reference,
            name : machine.name,
            workshop : machine.workshop,
            status : machine.status
        }))
    })
}

