import React, { useState, useEffect } from "react";
import {
  Grid,
  FormControl,
  TextField,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Box,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import useSettings from "../../hooks/useSettings";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4),
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  accordion: {
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },
  fieldGrid: {
    marginBottom: theme.spacing(2),
  },
  passwordField: {
    display: "flex",
    alignItems: "center",
  },
}));

export default function Integrations({ settings }) {
  const classes = useStyles();
  const { update } = useSettings();

  const [config, setConfig] = useState({
    ipixc: "",
    tokenixc: "",
    ipmkauth: "",
    clientidmkauth: "",
    clientsecretmkauth: "",
    asaas: "",
    smtpauth: "",
    usersmtpauth: "",
    clientsecretsmtpauth: "",
    smtpport: "",
  });

  const [loading, setLoading] = useState({
    ipixc: false,
    tokenixc: false,
    ipmkauth: false,
    clientidmkauth: false,
    clientsecretmkauth: false,
    asaas: false,
    smtpauth: false,
    usersmtpauth: false,
    clientsecretsmtpauth: false,
    smtpport: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {
      const newConfig = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      setConfig(newConfig);
    }
  }, [settings]);

  const handleChange = async (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setLoading((prev) => ({ ...prev, [key]: true }));
    await update({ key, value });
    toast.success("Operação atualizada com sucesso.");
    setLoading((prev) => ({ ...prev, [key]: false }));
  };

  const renderTextField = (id, label, value, onChange, loadingKey, type = "text") => (
    <Grid item xs={12} sm={6} md={6}>
      <FormControl className={classes.selectContainer}>
        <TextField
          id={id}
          name={id}
          label={label}
          variant="outlined"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          margin="dense"
          type={type}
          InputProps={
            type === "password"
              ? {
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  ),
                }
              : null
          }
        />
        <FormHelperText>{loading[loadingKey] && "Atualizando..."}</FormHelperText>
      </FormControl>
    </Grid>
  );

  return (
    <Box className={classes.container}>
      <Accordion className={classes.accordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          style={{ backgroundColor: '#F0F0F0', color: '#757575', borderRadius: '4px' }}
        >
          IXC - Integração com o sistema IXC para gestão de clientes e contratos.
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3} className={classes.fieldGrid}>
            {renderTextField(
              "ipixc",
              "IP do IXC",
              config.ipixc,
              (value) => handleChange("ipixc", value),
              "ipixc"
            )}
            {renderTextField(
              "tokenixc",
              "Token do IXC",
              config.tokenixc,
              (value) => handleChange("tokenixc", value),
              "tokenixc"
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion className={classes.accordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          style={{ backgroundColor: '#F0F0F0', color: '#757575', borderRadius: '4px' }}
        >
          MK-AUTH - Integração com o sistema MK-AUTH para autenticação e controle de acessos.
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3} className={classes.fieldGrid}>
            {renderTextField(
              "ipmkauth",
              "IP Mk-Auth",
              config.ipmkauth,
              (value) => handleChange("ipmkauth", value),
              "ipmkauth"
            )}
            {renderTextField(
              "clientidmkauth",
              "Client ID",
              config.clientidmkauth,
              (value) => handleChange("clientidmkauth", value),
              "clientidmkauth"
            )}
            {renderTextField(
              "clientsecretmkauth",
              "Client Secret",
              config.clientsecretmkauth,
              (value) => handleChange("clientsecretmkauth", value),
              "clientsecretmkauth"
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion className={classes.accordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          style={{ backgroundColor: '#F0F0F0', color: '#757575', borderRadius: '4px' }}
        >
          ASAAS - Integração com a plataforma ASAAS para cobranças e pagamentos.
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3} className={classes.fieldGrid}>
            {renderTextField(
              "asaas",
              "Token ASAAS",
              config.asaas,
              (value) => handleChange("asaas", value),
              "asaas"
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion className={classes.accordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          style={{ backgroundColor: '#F0F0F0', color: '#757575', borderRadius: '4px' }}
        >
          SMTP - Configuração do servidor SMTP para envio de e-mails.
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3} className={classes.fieldGrid}>
            {renderTextField(
              "smtpauth",
              "Servidor SMTP",
              config.smtpauth,
              (value) => handleChange("smtpauth", value),
              "smtpauth"
            )}
            {renderTextField(
              "usersmtpauth",
              "Usuário SMTP",
              config.usersmtpauth,
              (value) => handleChange("usersmtpauth", value),
              "usersmtpauth"
            )}
            {renderTextField(
              "clientsecretsmtpauth",
              "Senha SMTP",
              config.clientsecretsmtpauth,
              (value) => handleChange("clientsecretsmtpauth", value),
              "clientsecretsmtpauth",
              showPassword ? "text" : "password"
            )}
            {renderTextField(
              "smtpport",
              "Porta SMTP",
              config.smtpport,
              (value) => handleChange("smtpport", value),
              "smtpport"
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
