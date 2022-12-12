import { initDb } from '../database/index.js';
import { sendEmail } from '../controller/email.js';
import { config } from '../config/axios.js'
import axios from 'axios';

const verifySql = (sql) => {
    sql = sql.toUpperCase();
    if(sql.includes('UPDATE') || sql.includes('DELETE') || sql.includes('INSERT')){
        throw new Error('You can\'t update or delete data');
    }
}

const mountEmail = (report, req) => {
    const { url, name } = report;

    req.body.to = 'matheusgleiciel@gmail.com';
    req.body.subject = 'Relatório';
    req.body.text = url;
    req.body.html = `<h1>${name}</h1>
                    <p>Segue o link para o relatório</p>
                    <a href="${url}">Relatório</a>`;
    return req;
}

const mountParams = (response, reportID) => {
    const json = [{
        lista: JSON.parse(JSON.stringify(response))
    }];
    const params = new URLSearchParams();
    params.append('json', JSON.stringify(json));
    params.append('id_relatorio', reportID);
    return params;
}

export const generateReport = async (req, res) => {
    try {
        const { client, sql, reportID, reportName } = req.body;
        if(!client || !sql || !reportID || !reportName){
            throw new Error('Missing required fields');
        }
        verifySql(sql);
        const pool = initDb(client);
        const { rows } = await pool.query(sql);
        const params = mountParams(rows, reportID);
        const report = await axios.post('http://187.87.138.176:5001/relatorio/gerar', params, config);
        report.data.name = reportName; 
        const email = mountEmail(report.data, req);
        sendEmail(email, res);
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Error',
            error: error.message
        });
    }
}