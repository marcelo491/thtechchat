import React, { useState, useEffect } from "react";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { makeStyles, Paper, Tabs, Tab } from "@material-ui/core";
import MessagesAPI from "../MessagesAPI"; // Novo componente importado
import TabPanel from "../../components/TabPanel";
import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";
import Integrations from "../../components/Settings/Integrations";
import {
  PlugZap,
  SlidersHorizontal,
  Image,
  Building2,
  Factory,
  NotebookPen,
  Info,
  Blocks,
} from "lucide-react";
import { i18n } from "../../translate/i18n.js";
import { toast } from "react-toastify";
import Uploader from "../../components/Settings/Uploader";
import useCompanies from "../../hooks/useCompanies";
import useAuth from "../../hooks/useAuth.js";
import useSettings from "../../hooks/useSettings";
import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import CompanyForm from "../../components/Settings/CompanyForm";
import moment from 'moment';
import toastError from '../../errors/toastError';
import { openApi } from '../../services/api';

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    background: theme.palette.type === 'dark' ? '#2c2c2c' : theme.palette.optionsBackground,
  },
  mainPaper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    flex: 1,
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "8px", // Espaçamento entre ícone e texto
    textTransform: "none",
    fontWeight: "bold",
    fontSize: "0.875rem",
    padding: "12px 16px",
    //borderRadius: "0px",
   // margin: "0px 0",
    transition: "all 0.3s ease-in-out",
    cursor: "pointer",
    color: theme.palette.type === 'dark' ? '#ffffff' : '#000000',
    backgroundColor: theme.palette.type === 'dark' ? '#424242' : '#F8F8F8',
    border: `0px solid ${theme.palette.type === 'dark' ? '#555555' : '#CCCCCC'}`,
    
    "&.selected": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      border: `0px solid ${theme.palette.primary.main}`,
    },
  },

  paper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  container: {
    width: "100%",
    maxHeight: "100%",
  },
  control: {
    padding: theme.spacing(1),
  },
  textfield: {
    width: "100%",
  },
}));

const SettingsCustom = () => {
  const classes = useStyles();
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [settings, setSettings] = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);

  const { getCurrentUserInfo } = useAuth();
  const { find, updateSchedules } = useCompanies();
  const { getAll: getAllSettings } = useSettings();

  useEffect(() => {
    async function findData() {
      setLoading(true);
      try {
        const companyId = localStorage.getItem("companyId");
        const company = await find(companyId);
        const settingList = await getAllSettings();
        setCompany(company);
        setSchedules(company.schedules);
        setSettings(settingList);

        if (Array.isArray(settingList)) {
          const scheduleType = settingList.find(
            (d) => d.key === "scheduleType"
          );
          if (scheduleType) {
            setSchedulesEnabled(scheduleType.value === "company");
          }
        }

        const user = await getCurrentUserInfo();
        setCurrentUser(user);
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();
  }, []);

  const handleTabChange = (event, newValue) => {
    async function findData() {
      setLoading(true);
      try {
        const companyId = localStorage.getItem("companyId");
        const company = await find(companyId);
        const settingList = await getAllSettings();
        setCompany(company);
        setSchedules(company.schedules);
        setSettings(settingList);

        if (Array.isArray(settingList)) {
          const scheduleType = settingList.find(
            (d) => d.key === "scheduleType"
          );
          if (scheduleType) {
            setSchedulesEnabled(scheduleType.value === "company");
          }
        }

        const user = await getCurrentUserInfo();
        setCurrentUser(user);
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();

    setTab(newValue);
  };

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      await updateSchedules({ id: company.id, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const handleSignUp = async (values) => {
    const dueDate = moment().add(7, 'day').format();
    Object.assign(values, { recurrence: 'MENSAL' });
    Object.assign(values, { dueDate: dueDate });
    Object.assign(values, { status: 't' });
    Object.assign(values, { campaignsEnabled: true });

    try {
      await openApi.post('/companies/cadastro', values);
      toast.success('Cadastro realizado com sucesso!');
    } catch (err) {
      console.log(err);
      toastError(err);
    }
  };

  const isSuper = () => {
    return currentUser.super;
  };

  return (
  <MainContainer className={classes.root}>
    <MainHeader>
      <Title>{i18n.t("settings.title")}</Title>
    </MainHeader>
    <Paper className={classes.mainPaper} elevation={1}>
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        scrollButtons="on"
        variant="scrollable"
        onChange={handleTabChange}
        className={classes.tab}
      >
        <Tab
          label="Opções"
          value={"options"}
          icon={<SlidersHorizontal size={20} />}
        />
        {schedulesEnabled && (
          <Tab
            label="Horários"
            value={"schedules"}
            icon={<NotebookPen size={20} />}
          />
        )}
         {isSuper() && (
    <Tab
      label="Logo"
      value={"uploader"}
      icon={<Image size={20} />}
    />
  )}
        {isSuper() && (
          <Tab
            label="Empresas"
            value={"companies"}
            icon={<Building2 size={20} />}
          />
        )}
        {isSuper() && (
          <Tab
            label="Cadastrar Empresa"
            value={"newcompanie"}
            icon={<Factory size={20} />}
          />
        )}
        {isSuper() && (
          <Tab label="Planos" value={"plans"} icon={<Blocks size={20} />} />
        )}
        {isSuper() && (
          <Tab label="Ajuda" value={"helps"} icon={<Info size={20} />} />
        )}
        {isSuper() && (
          <Tab
            label="Integrações"
            value={"integrations"}
            icon={<PlugZap size={20} />}
          />
        )}
        {isSuper() && (
    <Tab
      label="Messages API"
      value={"messagesapi"}
      icon={<PlugZap size={20} />}
    />
  )}
      </Tabs>
      <Paper className={classes.paper} elevation={0}>
        <TabPanel className={classes.container} value={tab} name={"options"}>
          <Options
            settings={settings}
            scheduleTypeChanged={(value) =>
              setSchedulesEnabled(value === "company")
            }
          />
        </TabPanel>
        <TabPanel className={classes.container} value={tab} name={"schedules"}>
          <SchedulesForm
            loading={loading}
            onSubmit={handleSubmitSchedules}
            initialValues={schedules}
          />
        </TabPanel>
        <OnlyForSuperUser
          user={currentUser}
          yes={() => (
            <TabPanel
              className={classes.container}
              value={tab}
              name={"companies"}
            >
              <CompaniesManager />
            </TabPanel>
          )}
        />
        <OnlyForSuperUser
          user={currentUser}
          yes={() => (
            <TabPanel
              className={classes.container}
              value={tab}
              name={"newcompanie"}
            >
              <CompanyForm
                initialValues={{
                  name: "",
                  email: "",
                  password: "",
                  phone: "",
                  companyName: "",
                  planId: "",
                }}
                onSubmit={handleSignUp}
              />
            </TabPanel>
          )}
        />
        <OnlyForSuperUser
          user={currentUser}
          yes={() => (
            <TabPanel className={classes.container} value={tab} name={"plans"}>
              <PlansManager />
            </TabPanel>
          )}
        />
        <OnlyForSuperUser
          user={currentUser}
          yes={() => (
            <TabPanel className={classes.container} value={tab} name={"helps"}>
              <HelpsManager />
            </TabPanel>
          )}
        />
        <TabPanel
          className={classes.container}
          value={tab}
          name={"integrations"}
        >
          <Integrations settings={settings} />
        </TabPanel>
         <TabPanel className={classes.container} value={tab} name={"messagesapi"}>
           <MessagesAPI />
  </TabPanel>
<TabPanel
  className={classes.container}
  value={tab}
  name={"uploader"}
>
  <Uploader />
</TabPanel>
</Paper>
</Paper>
</MainContainer>
);
};

export default SettingsCustom;
