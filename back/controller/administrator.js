import { initDb } from "../database/index.js";

export const runGeneralSql = async (req, res) => {
    try {
        let {client, sql} = req.body;

        if(!client || !sql){
            return res.status(400).json({
                message: 'Missing required fields'
            });
        }

        sql = sql.toUpperCase();

        if(sql.includes('UPDATE') || sql.includes('DELETE') || sql.includes('INSERT')){
            return res.status(400).json({
                message: 'You can\'t update or delete data'
            });
        }
    
        const pool = initDb(client);
    
        const response = await pool.query(sql);
    
        return res.status(200).json({
            message: 'Success', 
            data: response.rows
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error',
            error
        });
    }
}

export const getAllDailysByProfessorName = async (req, res) => {
    try {
        const {name, client} = req.body;

        if(!name || !client){
            return res.status(400).json({
                message: 'Missing required fields'
            });
        }
    
        const pool = initDb(client);

        const sql = `SELECT
                        d.*,
                        ds.ds_disciplina
                    FROM
                        diario d
                    JOIN disciplina_professor dp ON dp.id_disciplina_professor = d.id_disciplina_professor
                    JOIN disciplina ds ON ds.id_disciplina = dp.id_disciplina
                    JOIN pessoa p ON p.id_pessoa = dp.id_professor
                    WHERE
                        p.nome ILIKE $1`;
    
        const response = await pool.query(sql, [`%${name}%`]);
    
        return res.status(200).json({
            message: 'Success', 
            data: response.rows
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error',
            error
        });
    }
}