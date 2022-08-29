const migrate = (req, res, databases_) => {
    let {text, databases, excludes} = req.body;
    let count = 0;
    const successfull = [];
    const errors = [];
    const sql = text;

    if(!text){
        return res.status(400).json({
            error: 'Missing text'
        });
    }

    if(databases === undefined) {
        databases = databases_;
    }

    if(excludes !== undefined) {
        databases = databases.filter(database => !excludes.includes(database));
    }

    databases.map(async database => {
        const pool = initDb(database);
        
        try {
            await pool.query(sql);
            successfull.push({database, success: true});
            count++;
        } catch (error) {
            errors.push({database, error});
            count++;
        }

        if(count === databases.length) {
            await pool.end();

            return res.status(200).json({
                successfull,
                errors,
            });
        }

    });
}

export const migrateSecDatabase = (req, res) => {
    const databases = ['sgedu_homologacao', 'sgedu_ferreiros', 'sgedu_pedras_de_fogo', 'sgedu_cupira', 'sgedu_belo_jardim', 'sgedu_calumbi'];
    migrate(req, res, databases);
}

export const migrateUniDatabase = (req, res) =>{
    const databases = ['sgedu_fundaj'];
    migrate(req, res, databases);
}