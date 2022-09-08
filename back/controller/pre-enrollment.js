import { initDb } from "../database/index.js";
import { verifyCPF } from "../helpers/verifyCPF.js";

const pool = initDb('sgedu_fundaj');

export const parameters = async (req, res) => {
    try {
        const { course_id } = req.params;

        const sql = `SELECT
                        dp.*
                    FROM
                        curso_documento_prematricula cdp 
                    JOIN documento_prematricula dp ON dp.id_documento_prematricula = cdp.id_documento_prematricula
                    WHERE
                        cdp.id_curso = ${course_id}`;

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

export const schools = async (req, res) => {
    try {
        const sql = `SELECT * FROM escola WHERE id_escola <> 85 ORDER BY nm_escola`;

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

export const classes = async (req, res) => {
    try {
        const { school_id } = req.params;

        const sql = `SELECT DISTINCT
                        t.id_turma as id,
                        upper(cm.ds_curso || ' ' || sm.ds_serie || ' (' || t2.ds_turno || ')' || ' (' || t.sigla  ||  ') ' || ' ' ||  s.ds_sala) AS name,
                        csm.id_curso as course_id
                    FROM
                        turma t
                    JOIN matricula m ON m.id_turma = t.id_turma
                    JOIN curso_serie csm ON csm.id_curso_serie = t.id_curso_serie
                    JOIN serie sm ON sm.id_serie = csm.id_serie
                    JOIN turno t2 ON t2.id_turno = csm.id_turno
                    JOIN curso cm ON cm.id_curso = csm.id_curso
                    JOIN sala s ON s.id_sala = t.id_sala
                    WHERE
                        csm.id_escola = ${school_id} AND
                        t.id_anoletivo = (SELECT i.id_anoletivo FROM instituicao i LIMIT 1)
                    ORDER BY
                        name`;

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
        const { id_curso, confirmEmail, ...data } = JSON.parse(req.body.dataObject);

        const files = req.files;
        
        await verifyCPF(data.cpf, pool);
        
        const sql = `INSERT INTO prematricula_fundaj (${Object.keys(data).join(',')}) VALUES (${Object.values(data).map((value) => typeof value === 'number' ? value : `'${value}'`).join(',')}) RETURNING id_prematricula`;
        
        const response = await pool.query(sql);
        
        const id = response.rows[0].id_prematricula;
        
        files.map(async (file) => {
            const path = file.path.replace(/\\/g, '/');

            const sql = `INSERT INTO prematricula_documentos_fundaj (id_prematricula, nome_documento, caminho_documento, id_documento_pre_matricula) VALUES (${id}, '${file.filename}', '${path}', ${file.fieldname})`;

            await pool.query(sql);
        });

        return res.status(200).json({
            message: 'Success',
            data: response.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error',
            error: error.message,
        });
    }
}