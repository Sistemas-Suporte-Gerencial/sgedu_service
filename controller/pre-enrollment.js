import { initDb } from "../database/index.js";

const pool = initDb('sgedu_fundaj');

export const tableParameters = async (req, res) => {
    try {
        const sql = `SELECT * FROM parametros_pre_matricula`;

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

export const insertNewPreEnrollment = async (req, res) => {
    try {
        const {...data} = req.body;
        const files = req.files;

        const sql = `INSERT INTO prematricula_fundaj (${Object.keys(data).join(',')}) VALUES (${Object.values(data).map((value) => typeof value === 'number' ? value : `'${value}'`).join(',')}) RETURNING id_prematricula`;

        const response = await pool.query(sql);

        const id = response.rows[0].id_prematricula;

        files.map(async (file) => {
            const path = file.path.replace(/\\/g, '/');

            const sql = `INSERT INTO prematricula_documentos_fundaj (id_prematricula, nome_documento, caminho_documento, arquivo) VALUES (${id}, '${file.filename}', '${path}', '${file.fieldname}')`;

            await pool.query(sql);
        });

        return res.status(200).json({
            message: 'Success',
            data: response.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error',
            error
        });
    }
}