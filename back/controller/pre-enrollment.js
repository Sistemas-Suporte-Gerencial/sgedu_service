import { initDb } from "../database/index.js";
import axios from "axios";

const pool = initDb("sgedu_fundaj");

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
			message: "Success",
			data: response.rows,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error",
			error,
		});
	}
};

export const schools = async (req, res) => {
	try {
		const sql = `SELECT * FROM escola WHERE id_escola <> 85 ORDER BY nm_escola`;

		const response = await pool.query(sql);

		return res.status(200).json({
			message: "Success",
			data: response.rows,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error",
			error,
		});
	}
};

export const classes = async (req, res) => {
	try {
		const { school_id } = req.params;

		const sql = `SELECT DISTINCT
                        t.id_turma as id,
                        upper(cm.ds_curso || ' ' || sm.ds_serie || ' (' || t2.ds_turno || ')' || ' (' || t.sigla  ||  ') ' || ' ' ||  s.ds_sala) AS name,
                        csm.id_curso as course_id
                    FROM
                        turma t
                    JOIN curso_serie csm ON csm.id_curso_serie = t.id_curso_serie
                    JOIN serie sm ON sm.id_serie = csm.id_serie
                    JOIN turno t2 ON t2.id_turno = csm.id_turno
                    JOIN curso cm ON cm.id_curso = csm.id_curso
                    JOIN sala s ON s.id_sala = t.id_sala
                    WHERE
                        csm.id_escola = ${school_id} AND
                        t.id_anoletivo = (SELECT i.id_anoletivo FROM instituicao i LIMIT 1) AND
                        t.prematricula = TRUE AND
												t.limit_pre_matricula::int >= (SELECT COALESCE(count(m.id_matricula), 0) FROM matricula m WHERE m.id_turma = t.id_turma)
                    ORDER BY
                        name`;

		const response = await pool.query(sql);

		return res.status(200).json({
			message: "Success",
			data: response.rows,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error",
			error,
		});
	}
};

export const insertNewPreEnrollment = async (req, res) => {
	try {
		const { id_curso, confirmEmail, ...data } = JSON.parse(
			req.body.dataObject
		);

		const files = req.files;

		const sql = `INSERT INTO prematricula_fundaj (${Object.keys(data).join(
			","
		)}) VALUES (${Object.values(data)
			.map((value) => (typeof value === "number" ? value : `'${value}'`))
			.join(",")}) RETURNING id_prematricula`;

		const response = await pool.query(sql);

		const id = response.rows[0].id_prematricula;

		files.forEach(async (file) => {
			let path = file.path.replace(/\\/g, "/");
			path = path.split("/").slice(4).join("/");

			const sql = `INSERT INTO prematricula_documentos_fundaj (id_prematricula, nome_documento, caminho_documento, id_documento_prematricula) VALUES (${id}, '${
				file.filename
			}', '${"../" + path}', ${file.fieldname})`;

			await pool.query(sql);
		});

		await axios.post('http://18.188.222.42:3000/email/send', {
			to: confirmEmail,
			subject: 'Confirmação de pré-matrícula',
			text: `Sua PRÉ-MATRICULA foi realizada com sucesso!
				  Em breve, você receberá outro e-mail com a confirmação de matricula
				  e informações de acesso à plataforma. Atenciosamente, equipe de matrícula.`,
			html: `<h1>Sua PRÉ-MATRICULA foi realizada com sucesso!</h1>
				  <br/>
				  <p>
				  	Em breve, você receberá outro e-mail com a confirmação de matricula e
					informações de acesso à plataforma.
				  </p>
				  <br/>
				  <p>Atenciosamente, equipe de matrícula.</p>`
		});

		return res.status(200).json({
			message: "Success",
			data: response.rows[0],
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Error",
			error: error.message,
		});
	}
};

export const getPersonByCpf  = async (req, res) => {
	try {
		const { cpf } = req.params;
		let sql = `SELECT
									pf.nome_completo,
									pf.rg,
									pf.email,
									pf.telefone,
									pf.nome_certificado,
									pf.servidor_publico,
									pf.orgao_publico,
									pf.nacionalidade,
								FROM
									prematricula_fundaj pf
								WHERE
									pf.cpf = '${cpf}'`;
		const prematricula = await pool.query(sql);
		if(prematricula.rows.length === 0) {
			return res.status(404).json({
				message: "Not Found",
				data: prematricula.rows,
			});
		}
		sql = `SELECT
						'sgedu.suportegerencial.com.br/sistema-educacional-uni//'||pdf.caminho_documento 
					FROM
						prematricula_fundaj pf
					JOIN prematricula_documentos_fundaj pdf ON pdf.id_prematricula = pf.id_prematricula
					WHERE
						pf.cpf = '52137066491'`;
		const documentos  = await pool.query(sql);
		return res.status(200).json({
			message: "Success",
			data: {
				prematricula: prematricula.rows,
				documentos: documentos.rows
			},
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error",
			error,
		});
	}
};