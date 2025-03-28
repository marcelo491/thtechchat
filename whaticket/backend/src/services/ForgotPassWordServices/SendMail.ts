import nodemailer from "nodemailer";
import sequelize from "sequelize";
import database from "../../database";
import Setting from "../../models/Setting";
import Company from "../../models/Company";

interface UserData {
  companyId: number;
  // Outras propriedades que você obtém da consulta
}

/**
 * Função para verificar se o e-mail existe no banco de dados.
 * (Utilizando query parametrizada para evitar SQL Injection)
 */
const filterEmail = async (email: string) => {
  const sql = `SELECT * FROM "Users" WHERE email = :email`;
  const result = await database.query(sql, {
    replacements: { email },
    type: sequelize.QueryTypes.SELECT,
  });
  // Note: Ajustamos para retornar result diretamente (sem encapsular em array extra)
  return { hasResult: result.length > 0, data: result };
};

/**
 * Função para atualizar o token de redefinição de senha no banco de dados.
 * (Utilizando query parametrizada para maior segurança)
 */
const insertToken = async (email: string, tokenSenha: string) => {
  const sqls = `UPDATE "Users" SET "resetPassword" = :tokenSenha WHERE email = :email`;
  const results = await database.query(sqls, {
    replacements: { email, tokenSenha },
    type: sequelize.QueryTypes.UPDATE,
  });
  return { hasResults: results.length > 0, datas: results };
};

/**
 * Função para envio do e-mail de redefinição de senha.
 *
 * @param email - E-mail do usuário.
 * @param tokenSenha - Token de redefinição de senha.
 */
const SendMail = async (email: string, tokenSenha: string) => {
  // Verifica se o e-mail existe no banco de dados
  const { hasResult, data } = await filterEmail(email);
  if (!hasResult) {
    return { status: 404, message: "E-mail não encontrado" };
  }

  // Considera o primeiro registro retornado
  const userData = data[0] as UserData;
  if (!userData || userData.companyId === undefined) {
    return { status: 404, message: "Dados do usuário não encontrados" };
  }
  
  
  const companyId = 1;
  //const companyId = userData.companyId;

  // Busca as configurações SMTP do banco de dados para a companyId especificada
  const [urlSmtpSetting, userSmtpSetting, passwordSmtpSetting, portSmtpSetting] = await Promise.all([
    Setting.findOne({ where: { companyId, key: 'smtpauth' } }),
    Setting.findOne({ where: { companyId, key: 'usersmtpauth' } }),
    Setting.findOne({ where: { companyId, key: 'clientsecretsmtpauth' } }),
    Setting.findOne({ where: { companyId, key: 'smtpport' } })
  ]);

  const urlSmtp = urlSmtpSetting?.value;
  const userSmtp = userSmtpSetting?.value;
  const passwordSmtp = passwordSmtpSetting?.value;
  const fromEmail = userSmtp; // E-mail de origem definido como o usuário SMTP
  const portSmtp = portSmtpSetting?.value;

  if (!urlSmtp || !userSmtp || !passwordSmtp || !portSmtp) {
    throw new Error("Configurações SMTP estão incompletas");
  }

  // Configura o transportador para envio do e-mail (ajustando secure conforme a porta)
  const transporter = nodemailer.createTransport({
    host: urlSmtp,
    port: Number(portSmtp),
    secure: Number(portSmtp) === 465, // Conexão segura se a porta for 465
    auth: {
      user: userSmtp,
      pass: passwordSmtp
    },
    tls: {
      rejectUnauthorized: false // Permite certificados autoassinados, se necessário
    }
  });

  // Se o e-mail foi encontrado, atualiza o token de redefinição no banco de dados
  if (hasResult === true) {
    await insertToken(email, tokenSenha);

    // Busca os dados da empresa para personalizar o e-mail
    const company = await Company.findByPk(companyId);
    if (!company) {
      return { status: 404, message: "Empresa não encontrada" };
    }

    // Função interna para enviar o e-mail com mensagem aprimorada
    async function sendEmail() {
      try {
        const mailOptions = {
          from: fromEmail,
          to: email,
          subject: `Redefinição de Senha - ${company.name}`,
          text: `Olá,

Você solicitou a redefinição de senha para sua conta no ${company.name}.
Utilize o seguinte Código de Verificação para concluir o processo:

>>> ${tokenSenha} <<<

Copie e cole o código acima no campo apropriado na plataforma ${company.name}.
Caso você não tenha solicitado essa redefinição, ignore este e-mail.

Atenciosamente,
Equipe ${company.name}`,
          html: `
            <p>Olá,</p>
            <p>Você solicitou a redefinição de senha para sua conta no <strong>${company.name}</strong>.</p>
            <p>
              Utilize o seguinte <span style="font-size: 18px; font-weight: bold; color: #d9534f;">
              Código de Verificação: ${tokenSenha}</span> para concluir o processo.
            </p>
            <p>Copie e cole o código acima no campo apropriado na plataforma ${company.name}.</p>
            <p>Caso você não tenha solicitado essa redefinição, ignore este e-mail.</p>
            <p>Atenciosamente,<br/><strong>Equipe ${company.name}</strong></p>
          `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("E-mail enviado: " + info.response);
      } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        return { status: 500, message: "Erro interno do servidor" };
      }
    }

    // Envia o e-mail
    sendEmail();
  }
};

export default SendMail;
