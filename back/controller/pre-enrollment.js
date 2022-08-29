import { initDb } from "../database/index.js";

const pool = initDb('sgedu_fundaj');

export const parameters = async (req, res) => {
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

export const schools = async (req, res) => {
    try {
        const sql = `SELECT * FROM escola ORDER BY nm_escola`;

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
        const {class_id} = req.body;

        const sql = `SELECT DISTINCT
                        t.id_turma as id,
                        upper(cm.ds_curso || ' ' || sm.ds_serie || ' (' || t2.ds_turno || ')' || ' (' || t.sigla  ||  ') ' || ' ' ||  s.ds_sala) AS name
                    FROM
                        turma t
                    JOIN matricula m ON m.id_turma = t.id_turma
                    JOIN serie_multiseries sm ON sm.id_serie = m.id_serie
                    JOIN curso_serie_multiseries csm ON csm.id_curso_serie = t.id_curso_serie
                    JOIN turno t2 ON t2.id_turno = csm.id_turno 
                    JOIN curso_multiseries cm ON cm.id_curso = csm.id_curso
                    JOIN sala s ON s.id_sala = t.id_sala
                    WHERE
                        csm.id_escola = ${class_id} AND
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