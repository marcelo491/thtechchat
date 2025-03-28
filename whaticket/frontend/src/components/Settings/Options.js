import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import FormHelperText from "@material-ui/core/FormHelperText";
import { Typography, Divider, Paper, Tabs, Tab } from "@material-ui/core";
import { ToastContainer, toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import useSettings from "../../hooks/useSettings";
import useAuth from "../../hooks/useAuth.js";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  tab: {
    backgroundColor: theme.palette.options,
    borderRadius: 4,
    width: "100%",
    "& .MuiTab-wrapper": {
      color: theme.palette.fontecor,
    },
    "& .MuiTabs-flexContainer": {
      justifyContent: "center",
    },
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "14px",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
}));

export default function Options(props) {
  const { settings, scheduleTypeChanged } = props;
  const classes = useStyles();
  const { user: currentUser } = useAuth();
  const { update } = useSettings();

  // Estados para configurações básicas
  const [userRating, setUserRating] = useState("disabled");
  const [scheduleType, setScheduleType] = useState("disabled");
  const [callType, setCallType] = useState("enabled");
  const [chatbotType, setChatbotType] = useState("");
  const [CheckMsgIsGroup, setCheckMsgIsGroupType] = useState("enabled");

  const [loadingUserRating, setLoadingUserRating] = useState(false);
  const [loadingScheduleType, setLoadingScheduleType] = useState(false);
  const [loadingCallType, setLoadingCallType] = useState(false);
  const [loadingChatbotType, setLoadingChatbotType] = useState(false);
  const [loadingCheckMsgIsGroup, setLoadingCheckMsgIsGroup] = useState(false);

  // Recursos adicionais
  const [trial, settrial] = useState("3");
  const [loadingtrial, setLoadingtrial] = useState(false);

  const [viewgroups, setviewgroups] = useState("disabled");
  const [loadingviewgroups, setLoadingviewgroups] = useState(false);

  const [viewregister, setviewregister] = useState("disabled");
  const [loadingviewregister, setLoadingviewregister] = useState(false);

  const [allowregister, setallowregister] = useState("disabled");
  const [loadingallowregister, setLoadingallowregister] = useState(false);

  // Configuração já existente para saudação ao aceitar o ticket
  const [SendGreetingAccepted, setSendGreetingAccepted] = useState("disabled");
  const [loadingSendGreetingAccepted, setLoadingSendGreetingAccepted] = useState(false);

  const [SettingsTransfTicket, setSettingsTransfTicket] = useState("disabled");
  const [loadingSettingsTransfTicket, setLoadingSettingsTransfTicket] = useState(false);

  const [sendGreetingMessageOneQueues, setSendGreetingMessageOneQueues] = useState("disabled");
  const [loadingSendGreetingMessageOneQueues, setLoadingSendGreetingMessageOneQueues] = useState(false);

  // Novo estado para a configuração da obrigatoriedade de saudação nas conexões
  const [connectionGreetingRequired, setConnectionGreetingRequired] = useState("enabled");
  const [loadingConnectionGreetingRequired, setLoadingConnectionGreetingRequired] = useState(false);

  // Novos estados para a configuração do CAPTCHA (apenas para superusuários)
  const [captcha, setCaptcha] = useState("disabled");
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  // useEffect para carregar as configurações do backend
  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {
      const userRatingSetting = settings.find((s) => s.key === "userRating");
      if (userRatingSetting) setUserRating(userRatingSetting.value);

      const scheduleTypeSetting = settings.find((s) => s.key === "scheduleType");
      if (scheduleTypeSetting) setScheduleType(scheduleTypeSetting.value);

      const callTypeSetting = settings.find((s) => s.key === "call");
      if (callTypeSetting) setCallType(callTypeSetting.value);

      const groupSetting = settings.find((s) => s.key === "CheckMsgIsGroup");
      if (groupSetting) setCheckMsgIsGroupType(groupSetting.value);

      const allowregisterSetting = settings.find((s) => s.key === "allowregister");
      if (allowregisterSetting) setallowregister(allowregisterSetting.value);

      const SendGreetingAcceptedSetting = settings.find((s) => s.key === "sendGreetingAccepted");
      if (SendGreetingAcceptedSetting) setSendGreetingAccepted(SendGreetingAcceptedSetting.value);

      const SettingsTransfTicketSetting = settings.find((s) => s.key === "sendMsgTransfTicket");
      if (SettingsTransfTicketSetting) setSettingsTransfTicket(SettingsTransfTicketSetting.value);

      const viewgroupsSetting = settings.find((s) => s.key === "viewgroups");
      if (viewgroupsSetting) setviewgroups(viewgroupsSetting.value);

      const viewregisterSetting = settings.find((s) => s.key === "viewregister");
      if (viewregisterSetting) setviewregister(viewregisterSetting.value);

      const sendGreetingMessageOneQueuesSetting = settings.find((s) => s.key === "sendGreetingMessageOneQueues");
      if (sendGreetingMessageOneQueuesSetting)
        setSendGreetingMessageOneQueues(sendGreetingMessageOneQueuesSetting.value);

      const chatbotTypeSetting = settings.find((s) => s.key === "chatBotType");
      if (chatbotTypeSetting) setChatbotType(chatbotTypeSetting.value);

      const trialSetting = settings.find((s) => s.key === "trial");
      if (trialSetting) settrial(trialSetting.value);

      // Carrega a configuração do CAPTCHA
      const captchaSetting = settings.find((s) => s.key === "captcha");
      if (captchaSetting) setCaptcha(captchaSetting.value);

      // Carrega a nova configuração para obrigatoriedade da saudação nas conexões
      const connectionGreetingSetting = settings.find((s) => s.key === "connectionGreetingRequired");
      if (connectionGreetingSetting) setConnectionGreetingRequired(connectionGreetingSetting.value);
    }
  }, [settings]);

  // Funções de atualização para as configurações
  async function handleChangeUserRating(value) {
    setUserRating(value);
    setLoadingUserRating(true);
    await update({ key: "userRating", value });
    toast.success("Operação atualizada com sucesso.");
    setLoadingUserRating(false);
  }

  async function handleallowregister(value) {
    setallowregister(value);
    setLoadingallowregister(true);
    await update({ key: "allowregister", value });
    toast.success("Operação atualizada com sucesso.");
    setLoadingallowregister(false);
  }

  async function handleSendGreetingMessageOneQueues(value) {
    setSendGreetingMessageOneQueues(value);
    setLoadingSendGreetingMessageOneQueues(true);
    await update({ key: "sendGreetingMessageOneQueues", value });
    toast.success("Operação atualizada com sucesso.");
    setLoadingSendGreetingMessageOneQueues(false);
  }

  async function handleviewregister(value) {
    setviewregister(value);
    setLoadingviewregister(true);
    await update({ key: "viewregister", value });
    toast.success("Operação atualizada com sucesso.");
    setLoadingviewregister(false);
  }

  async function handletrial(value) {
    settrial(value);
    setLoadingtrial(true);
    await update({ key: "trial", value });
    toast.success("Operação atualizada com sucesso.");
    setLoadingtrial(false);
  }

  async function handleScheduleType(value) {
    setScheduleType(value);
    setLoadingScheduleType(true);
    await update({ key: "scheduleType", value });
    toast.success("Operação atualizada com sucesso.", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: "light",
    });
    setLoadingScheduleType(false);
    if (typeof scheduleTypeChanged === "function") {
      scheduleTypeChanged(value);
    }
  }

  async function handleCallType(value) {
    setCallType(value);
    setLoadingCallType(true);
    await update({ key: "call", value });
    toast.success("Operação atualizada com sucesso.");
    setLoadingCallType(false);
  }

  async function handleChatbotType(value) {
    setChatbotType(value);
    setLoadingChatbotType(true);
    await update({ key: "chatBotType", value });
    toast.success("Operação atualizada com sucesso.");
    setLoadingChatbotType(false);
  }

  async function handleGroupType(value) {
    setCheckMsgIsGroupType(value);
    setLoadingCheckMsgIsGroup(true);
    await update({ key: "CheckMsgIsGroup", value });
    toast.success("Operação atualizada com sucesso.");
    setLoadingCheckMsgIsGroup(false);
  }

  async function handleviewgroups(value) {
    setviewgroups(value);
    setLoadingviewgroups(true);
    await update({ key: "viewgroups", value });
    toast.success("Operação atualizada com sucesso.");
    setLoadingviewgroups(false);
  }

  async function handleSendGreetingAccepted(value) {
    setSendGreetingAccepted(value);
    setLoadingSendGreetingAccepted(true);
    await update({ key: "sendGreetingAccepted", value });
    toast.success("Operação atualizada com sucesso.");
    setLoadingSendGreetingAccepted(false);
  }

  async function handleSettingsTransfTicket(value) {
    setSettingsTransfTicket(value);
    setLoadingSettingsTransfTicket(true);
    await update({ key: "sendMsgTransfTicket", value });
    toast.success("Operação atualizada com sucesso.");
    setLoadingSettingsTransfTicket(false);
  }

  // Nova função para atualizar a configuração da obrigatoriedade da saudação nas conexões
  async function handleConnectionGreetingRequired(value) {
    setConnectionGreetingRequired(value);
    setLoadingConnectionGreetingRequired(true);
    await update({ key: "connectionGreetingRequired", value });
    toast.success("Operação atualizada com sucesso.");
    setLoadingConnectionGreetingRequired(false);
  }

  // Função para atualizar a configuração do CAPTCHA (somente para superusuários)
  async function handleCaptcha(value) {
    setCaptcha(value);
    setLoadingCaptcha(true);
    await update({ key: "captcha", value });
    toast.success("Operação atualizada com sucesso.");
    setLoadingCaptcha(false);
  }

  return (
    <>
      <Grid spacing={3} container>
        {/* Configurações básicas */}
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="ratings-label">Avaliações</InputLabel>
            <Select
              labelId="ratings-label"
              value={userRating}
              onChange={async (e) => handleChangeUserRating(e.target.value)}
            >
              <MenuItem value={"disabled"}>Desabilitadas</MenuItem>
              <MenuItem value={"enabled"}>Habilitadas</MenuItem>
            </Select>
            <FormHelperText>
              {loadingUserRating && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="schedule-type-label">Gerenciamento de Expediente</InputLabel>
            <Select
              labelId="schedule-type-label"
              value={scheduleType}
              onChange={async (e) => handleScheduleType(e.target.value)}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"queue"}>Fila</MenuItem>
              <MenuItem value={"company"}>Empresa</MenuItem>
            </Select>
            <FormHelperText>
              {loadingScheduleType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="group-type-label">Ignorar Mensagens de Grupos</InputLabel>
            <Select
              labelId="group-type-label"
              value={CheckMsgIsGroup}
              onChange={async (e) => handleGroupType(e.target.value)}
            >
              <MenuItem value={"disabled"}>Desativado</MenuItem>
              <MenuItem value={"enabled"}>Ativado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingCheckMsgIsGroup && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="viewgroups-label">Operador Visualiza Grupos?</InputLabel>
            <Select
              labelId="viewgroups-label"
              value={viewgroups}
              onChange={async (e) => handleviewgroups(e.target.value)}
            >
              <MenuItem value={"disabled"}>Não</MenuItem>
              <MenuItem value={"enabled"}>Sim</MenuItem>
            </Select>
            <FormHelperText>
              {loadingviewgroups && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="call-type-label">Aceitar Chamada</InputLabel>
            <Select
              labelId="call-type-label"
              value={callType}
              onChange={async (e) => handleCallType(e.target.value)}
            >
              <MenuItem value={"disabled"}>Não Aceitar</MenuItem>
              <MenuItem value={"enabled"}>Aceitar</MenuItem>
            </Select>
            <FormHelperText>
              {loadingCallType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="chatbot-type-label">Tipo Chatbot</InputLabel>
            <Select
              labelId="chatbot-type-label"
              value={chatbotType}
              onChange={async (e) => handleChatbotType(e.target.value)}
            >
              <MenuItem value={"text"}>Texto</MenuItem>
              {/* Outras opções podem ser adicionadas */}
            </Select>
            <FormHelperText>
              {loadingChatbotType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Seletores referentes à saudação para ticket (já existente) */}
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendGreetingAccepted-label">
              Enviar saudação ao aceitar o ticket
            </InputLabel>
            <Select
              labelId="sendGreetingAccepted-label"
              value={SendGreetingAccepted}
              onChange={async (e) => handleSendGreetingAccepted(e.target.value)}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendGreetingAccepted && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Seletores referentes à mensagem de transferência */}
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendMsgTransfTicket-label">
              Enviar mensagem de transferência de Fila/agente
            </InputLabel>
            <Select
              labelId="sendMsgTransfTicket-label"
              value={SettingsTransfTicket}
              onChange={async (e) => handleSettingsTransfTicket(e.target.value)}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSettingsTransfTicket && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Seletores referentes à saudação quando há somente 1 fila */}
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendGreetingMessageOneQueues-label">
              Enviar saudação quando houver somente 1 fila
            </InputLabel>
            <Select
              labelId="sendGreetingMessageOneQueues-label"
              value={sendGreetingMessageOneQueues}
              onChange={async (e) => handleSendGreetingMessageOneQueues(e.target.value)}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendGreetingMessageOneQueues && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Novo seletor para a obrigatoriedade da saudação em conexões */}
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="connectionGreetingRequired-label">
              Exigir saudação para conexões
            </InputLabel>
            <Select
              labelId="connectionGreetingRequired-label"
              value={connectionGreetingRequired}
              onChange={async (e) => handleConnectionGreetingRequired(e.target.value)}
            >
              <MenuItem value={"disabled"}>Não Exigir</MenuItem>
              <MenuItem value={"enabled"}>Exigir</MenuItem>
            </Select>
            <FormHelperText>
              {loadingConnectionGreetingRequired && "Atualizando..."}
            </FormHelperText>
            <Typography variant="caption" color="textSecondary">
              Quando habilitado, se mais de uma fila for selecionada e a saudação não for informada, a validação será aplicada.
            </Typography>
          </FormControl>
        </Grid>
      </Grid>

      <OnlyForSuperUser
        user={currentUser}
        yes={() => (
          <>
            <Grid spacing={3} container>
              <Tabs
                indicatorColor="primary"
                textColor="primary"
                scrollButtons="on"
                variant="scrollable"
                className={classes.tab}
                style={{ marginBottom: 20, marginTop: 20 }}
              >
                <Tab label="Configurações Globais" />
              </Tabs>
            </Grid>

            <Grid xs={12} sm={12} md={12} item>
              <FormControl className={classes.selectContainer}>
                <InputLabel id="allowregister-label">
                  Registro (Inscrição) Permitida?
                </InputLabel>
                <Select
                  labelId="allowregister-label"
                  value={allowregister}
                  onChange={async (e) => handleallowregister(e.target.value)}
                >
                  <MenuItem value={"disabled"}>Não</MenuItem>
                  <MenuItem value={"enabled"}>Sim</MenuItem>
                </Select>
                <FormHelperText>
                  {loadingallowregister && "Atualizando..."}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={12} sm={12} md={12} item>
              <FormControl className={classes.selectContainer}>
                <InputLabel id="viewregister-label">
                  Registro (Inscrição) Visível?
                </InputLabel>
                <Select
                  labelId="viewregister-label"
                  value={viewregister}
                  onChange={async (e) => handleviewregister(e.target.value)}
                >
                  <MenuItem value={"disabled"}>Não</MenuItem>
                  <MenuItem value={"enabled"}>Sim</MenuItem>
                </Select>
                <FormHelperText>
                  {loadingviewregister && "Atualizando..."}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={12} sm={12} md={12} item>
              <FormControl className={classes.selectContainer}>
                <InputLabel id="trial-label">Tempo de Trial?</InputLabel>
                <Select
                  labelId="trial-label"
                  value={trial}
                  onChange={async (e) => handletrial(e.target.value)}
                >
                  <MenuItem value={"1"}>1</MenuItem>
                  <MenuItem value={"2"}>2</MenuItem>
                  <MenuItem value={"3"}>3</MenuItem>
                  <MenuItem value={"4"}>4</MenuItem>
                  <MenuItem value={"5"}>5</MenuItem>
                  <MenuItem value={"6"}>6</MenuItem>
                  <MenuItem value={"7"}>7</MenuItem>
                </Select>
                <FormHelperText>
                  {loadingtrial && "Atualizando..."}
                </FormHelperText>
              </FormControl>
            </Grid>

            {/* Configuração do CAPTCHA disponível apenas para superusuários */}
            <Grid xs={12} sm={12} md={12} item>
              <FormControl className={classes.selectContainer}>
                <InputLabel id="captcha-label">Exibir CAPTCHA no Login?</InputLabel>
                <Select
                  labelId="captcha-label"
                  value={captcha}
                  onChange={async (e) => handleCaptcha(e.target.value)}
                >
                  <MenuItem value={"disabled"}>Desabilitado</MenuItem>
                  <MenuItem value={"enabled"}>Habilitado</MenuItem>
                </Select>
                <FormHelperText>
                  {loadingCaptcha && "Atualizando..."}
                </FormHelperText>
              </FormControl>
            </Grid>
          </>
        )}
      />
      <ToastContainer />
    </>
  );
}
