##REQUESITOS 

-UBUNTU 20.04 (OBRIGATORIO)
-VM COM MINIMO: 2CPU 4GB RAM
-VM COM RECOMENDADO: 4CPU 6GB RAM


## CRIAR SUBDOMINIO E APONTAR PARA O IP DA SUA VPS ##

FRONTEND_URL: app.seudominio.com
BACKEND_URL:  api.seudominio.com

## CHECAR PROPAGAÇÃO DO DOMÍNIO ##

https://dnschecker.org/

## COPIAR A PASTA PARA ROOT E RODAR OS COMANDOS ABAIXO no Seu SERVIDOR SSH ##

cd ./whaticket
sudo chmod +x whaticketsaas
sudo ./whaticketsaas

===================================================

login: admin@admin.com
senha: 123456

===================================================

Configuração de e-mail dentro do BACKEND no arquivo ENV

MAIL_HOST="smtp.gmail.com"
MAIL_USER="seu-email"
MAIL_PASS="sua-senha"
MAIL_FROM="seu-email"
MAIL_PORT="587"

Configuração de pagamento GERENCIANET dentro BACKEND no arquivo ENV

GERENCIANET_SANDBOX=true
GERENCIANET_CLIENT_ID=sua-id
GERENCIANET_CLIENT_SECRET=sua_chave_secreta
GERENCIANET_PIX_CERT=nome_do_certificado
GERENCIANET_PIX_KEY=chave_pix_gerencianet

# para usar GERENCIANET Em backend\certs
# Salvar o certificado no formato .p12