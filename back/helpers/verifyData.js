export const verifyData = async (data, pool) => {
    try {
        const { cpf, rg } = data; 

        const sql = `SELECT pf.cpf FROM prematricula_fundaj pf WHERE pf.cpf = '${cpf}' OR pf.rg = '${rg}'`;

        const response = await pool.query(sql);

        if (response.rows.length > 0) {
            throw new Error('CPF ou RG já cadastrados');
        }

        return true;
    } catch (error) {
        throw new Error(error.message);
    }
}