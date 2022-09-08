export const verifyCPF = async (cpf, pool) => {
    try {
        const sql = `SELECT pf.cpf FROM prematricula_fundaj pf WHERE pf.cpf = '${cpf}'`;

        const response = await pool.query(sql);

        if (response.rows.length > 0) {
            throw new Error('CPF já cadastrado');
        }

        return true;
    } catch (error) {
        throw new Error(error.message);
    }
}