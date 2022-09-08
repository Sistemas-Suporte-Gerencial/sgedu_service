export const verifyCPF = async (cpf) => {
    try {
        const sql = `SELECT p.cpf FROM pessoa p WHERE p.cpf = '${cpf}'`;

        const response = await pool.query(sql);

        if (response.rows.length > 0) {
            throw new Error('CPF já cadastrado');
        }

        return true;
    } catch (error) {
        throw new Error(error.message);
    }
}