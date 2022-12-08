export const verifyData = async (data, pool) => {
    try {
        const { cpf, rg, id_escola } = data; 

        const sql = `SELECT 
                        pf.cpf 
                    FROM 
                        prematricula_fundaj pf 
                    WHERE 
                        pf.cpf = '${cpf}' OR 
                        pf.rg = '${rg}' AND 
                        pf.id_escola = ${id_escola} AND
                        pf.id_curso = ${id_curso}`;

        const response = await pool.query(sql);

        if (response.rows.length > 0) {
            throw new Error('CPF ou RG já cadastrados');
        }

        return true;
    } catch (error) {
        throw new Error(error.message);
    }
}