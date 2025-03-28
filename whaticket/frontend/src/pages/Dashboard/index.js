import React, { useContext, useState, useEffect } from "react";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import CallIcon from "@material-ui/icons/Call";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import MessageIcon from "@material-ui/icons/Message";
import SendIcon from "@material-ui/icons/Send";
import AccessAlarmIcon from "@material-ui/icons/AccessAlarm";
import TimerIcon from "@material-ui/icons/Timer";
import MobileFriendlyIcon from "@material-ui/icons/MobileFriendly";
import StoreIcon from "@material-ui/icons/Store";
import TodayIcon from "@material-ui/icons/Today";
import FilterListIcon from "@material-ui/icons/FilterList";
import ClearIcon from "@material-ui/icons/Clear";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";
import moment from "moment";
import { isArray, isEmpty } from "lodash";

import Chart from "./Chart";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { AuthContext } from "../../context/Auth/AuthContext";
import useCompanies from "../../hooks/useCompanies";
import useDashboard from "../../hooks/useDashboard";
import useContacts from "../../hooks/useContacts";
import useMessages from "../../hooks/useMessages";
import Filters from "./Filters";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  // Para garantir que em mobile os cards fiquem com largura total
  card: {
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "200px", // largura fixa para telas maiores, se necessário
    },
  },
  // Estilos dos Cards (para o Paper) – utilizei os mesmos nomes do seu código
  card0: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: "100px",
    backgroundColor: "#ffffff",
    borderRadius: 7,
    color: "#000",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  card00: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: "100px",
    backgroundColor: "#ffffff",
    borderRadius: 7,
    color: "#000",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  card1: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: "100px",
    backgroundColor: "#ffffff",
    borderRadius: 7,
    color: "#000",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  card2: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: "100px",
    backgroundColor: "#ffffff",
    borderRadius: 7,
    color: "#000",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  card3: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: "100px",
    backgroundColor: "#ffffff",
    borderRadius: 7,
    color: "#000",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  card4: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: "100px",
    backgroundColor: "#ffffff",
    borderRadius: 7,
    color: "#000",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  card5: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: "100px",
    backgroundColor: "#ffffff",
    borderRadius: 7,
    color: "#000",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  card6: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: "100px",
    backgroundColor: "#ffffff",
    borderRadius: 7,
    color: "#000",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  card7: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: "100px",
    backgroundColor: "#ffffff",
    borderRadius: 7,
    color: "#000",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  card8: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: "100px",
    backgroundColor: "#ffffff",
    borderRadius: 7,
    color: "#000",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  card9: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: "100px",
    backgroundColor: "#ffffff",
    borderRadius: 7,
    color: "#000",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  card10: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: "100px",
    backgroundColor: "#ffffff",
    borderRadius: 7,
    color: "#000",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  // Estilização dos ícones
  iconWrapper0: {
    fontSize: 25,
    padding: "6px",
    flex: 1,
    borderRadius: 7,
    backgroundColor: "#E7EDF6",
    color: "#696CFF",
  },
  iconWrapper00: {
    fontSize: 25,
    padding: "6px",
    flex: 1,
    borderRadius: 7,
    backgroundColor: "#F4F4F4",
    color: "#EF494B",
  },
  iconWrapper1: {
    fontSize: 25,
    padding: "6px",
    flex: 1,
    borderRadius: 7,
    backgroundColor: "#EDD9FF",
    color: "#EE11E5",
  },
  iconWrapper2: {
    fontSize: 25,
    padding: "6px",
    flex: 1,
    borderRadius: 7,
    backgroundColor: "#E1DFFF",
    color: "#FF6921",
  },
  iconWrapper3: {
    fontSize: 25,
    padding: "6px",
    flex: 1,
    borderRadius: 7,
    backgroundColor: "#CBFFEB",
    color: "#4429FF",
  },
  iconWrapper4: {
    fontSize: 25,
    padding: "6px",
    flex: 1,
    borderRadius: 7,
    backgroundColor: "#DDECFF",
    color: "#06AF6A",
  },
  iconWrapper5: {
    fontSize: 25,
    padding: "6px",
    flex: 1,
    borderRadius: 7,
    backgroundColor: "#FDE7FC",
    color: "#1570EF",
  },
  iconWrapper6: {
    fontSize: 25,
    padding: "6px",
    flex: 1,
    borderRadius: 7,
    backgroundColor: "#FFE9DE",
    color: "#9A23EE",
  },
  iconWrapper7: {
    fontSize: 25,
    padding: "6px",
    flex: 1,
    borderRadius: 7,
    backgroundColor: "#DDECFF",
    color: "#4429FF",
  },
  iconWrapper8: {
    fontSize: 25,
    padding: "6px",
    flex: 1,
    borderRadius: 7,
    backgroundColor: "#CBFFEB",
    color: "#4D9CED",
  },
  iconWrapper9: {
    fontSize: 25,
    padding: "6px",
    flex: 1,
    borderRadius: 7,
    backgroundColor: "#EDD9FF",
    color: "#00AD66",
  },
  iconWrapper10: {
    fontSize: 25,
    padding: "6px",
    flex: 1,
    borderRadius: 7,
    backgroundColor: "#FFE9DE",
    color: "#FF864B",
  },
  fixedHeightPaper2: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const theme = useTheme();
  // Detecta se a tela está abaixo do breakpoint "sm"
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Variáveis para os breakpoints do Grid:
  // xs sempre 12; sm e md serão 12 em mobile, caso contrário valores originais
  const gridXS = 12;
  const gridSM = isMobile ? 12 : 6;
  const gridMD = isMobile ? 12 : 2;

  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [period, setPeriod] = useState(0);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();
  const [companyDueDate, setCompanyDueDate] = useState();

  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  let now = `${year}-${month < 10 ? `0${month}` : month}-${date < 10 ? `0${date}` : date}`;

  const [showFilter, setShowFilter] = useState(false);
  const [dateStartTicket, setDateStartTicket] = useState(now);
  const [dateEndTicket, setDateEndTicket] = useState(now);
  const [queueTicket, setQueueTicket] = useState(false);
  const { finding: findingCompany } = useCompanies();

  const { user } = useContext(AuthContext);
  let userQueueIds = [];

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    // Adiciona um pequeno delay para simular o carregamento
    setTimeout(() => {
      firstLoad();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChangePeriod(value) {
    setPeriod(value);
  }

  async function handleChangeFilterType(value) {
    setFilterType(value);
    if (value === 1) {
      setPeriod(0);
    } else {
      setDateFrom("");
      setDateTo("");
    }
  }

  async function fetchData() {
    setLoading(true);
    let params = {};

    if (period > 0) {
      params = { days: period };
    }

    if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = { ...params, date_from: moment(dateFrom).format("YYYY-MM-DD") };
    }

    if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = { ...params, date_to: moment(dateTo).format("YYYY-MM-DD") };
    }

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);
    setCounters(data.counters);
    setAttendants(isArray(data.attendants) ? data.attendants : []);
    setLoading(false);
  }

  useEffect(() => {
    async function load() {
      await loadCompanies();
    }
    load();
  }, []);

  const companyId = localStorage.getItem("companyId");
  const loadCompanies = async () => {
    setLoading(true);
    try {
      const companiesList = await findingCompany(companyId);
      setCompanyDueDate(moment(companiesList.dueDate).format("DD/MM/yyyy"));
    } catch (e) {
      console.log("Erro ao carregar empresas:", e);
    }
    setLoading(false);
  };

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const GetUsers = () => {
    let userOnline = attendants.reduce(
      (total, user) => (user.online ? total + 1 : total),
      0
    );
    return userOnline;
  };

  const GetContacts = (all) => {
    let props = all ? {} : {};
    const { count } = useContacts(props);
    return count;
  };

  const GetMessages = (all, fromMe) => {
    let props = {};
    if (all) {
      props = fromMe ? { fromMe: true } : { fromMe: false };
    } else {
      props = {
        fromMe,
        dateStart: dateStartTicket,
        dateEnd: dateEndTicket,
      };
    }
    const { count } = useMessages(props);
    return count;
  };

  function toggleShowFilter() {
    setShowFilter(!showFilter);
  }

  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3} justifyContent="flex-end">
          <Grid item xs={12}>
            <Button onClick={toggleShowFilter} style={{ float: "right" }} color="primary">
              {!showFilter ? <FilterListIcon /> : <ClearIcon />}
            </Button>
          </Grid>

          {showFilter && (
            <Filters
              classes={classes}
              setDateStartTicket={setDateStartTicket}
              setDateEndTicket={setDateEndTicket}
              dateStartTicket={dateStartTicket}
              dateEndTicket={dateEndTicket}
              setQueueTicket={setQueueTicket}
              queueTicket={queueTicket}
            />
          )}

          {/* Linha de Cards */}
          {/* ATENDENDO */}
          <Grid item xs={gridXS} sm={gridSM} md={gridMD}>
            <Paper className={`${classes.card} ${classes.card1}`} elevation={4}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography variant="h7" component="h3" paragraph>
                    Atendendo
                  </Typography>
                  <Typography variant="h7" component="h3">
                    {counters.supportHappening}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <div className={classes.iconWrapper1}>
                    <CallIcon style={{ fontSize: 25 }} />
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* AGUARDANDO */}
          <Grid item xs={gridXS} sm={gridSM} md={gridMD}>
            <Paper className={`${classes.card} ${classes.card2}`} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography variant="h7" component="h3" paragraph>
                    Aguardando
                  </Typography>
                  <Typography variant="h7" component="h3">
                    {counters.supportPending}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <div className={classes.iconWrapper2}>
                    <HourglassEmptyIcon style={{ fontSize: 25 }} />
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* ONLINE */}
          <Grid item xs={gridXS} sm={gridSM} md={gridMD}>
            <Paper className={`${classes.card} ${classes.card6}`} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography variant="h7" component="h3" paragraph>
                    Online
                  </Typography>
                  <Typography variant="h7" component="h3">
                    {GetUsers()} <span style={{ color: "#ffffff" }}>/ {attendants.length}</span>
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <div className={classes.iconWrapper6}>
                    <RecordVoiceOverIcon style={{ fontSize: 25 }} />
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* CONCLUÍDOS */}
          <Grid item xs={gridXS} sm={gridSM} md={gridMD}>
            <Paper className={`${classes.card} ${classes.card3}`} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography variant="h7" component="h3" paragraph>
                    Concluídos
                  </Typography>
                  <Typography variant="h7" component="h3">
                    {counters.supportFinished}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <div className={classes.iconWrapper3}>
                    <CheckCircleIcon style={{ fontSize: 25 }} />
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* CONTATOS */}
          <Grid item xs={gridXS} sm={gridSM} md={gridMD}>
            <Paper className={`${classes.card} ${classes.card4}`} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography variant="h7" component="h3" paragraph>
                    Contatos
                  </Typography>
                  <Typography variant="h7" component="h3">
                    {GetContacts(true)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <div className={classes.iconWrapper4}>
                    <GroupAddIcon style={{ fontSize: 25 }} />
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* RECEBIDAS */}
          <Grid item xs={gridXS} sm={gridSM} md={gridMD}>
            <Paper className={`${classes.card} ${classes.card5}`} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography variant="h7" component="h3" paragraph>
                    Recebidas
                  </Typography>
                  <Typography variant="h7" component="h3">
                    {GetMessages(false, false)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <div className={classes.iconWrapper5}>
                    <MessageIcon style={{ fontSize: 25 }} />
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* ENVIADAS */}
          <Grid item xs={gridXS} sm={gridSM} md={gridMD}>
            <Paper className={`${classes.card} ${classes.card7}`} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography variant="h7" component="h3" paragraph>
                    Enviadas
                  </Typography>
                  <Typography variant="h7" component="h3">
                    {GetMessages(false, true)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <div className={classes.iconWrapper7}>
                    <SendIcon style={{ fontSize: 25 }} />
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* MÉDIA */}
          <Grid item xs={gridXS} sm={gridSM} md={gridMD}>
            <Paper className={`${classes.card} ${classes.card8}`} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography variant="h7" component="h3" paragraph>
                    Média
                  </Typography>
                  <Typography variant="h7" component="h3">
                    {formatTime(counters.avgSupportTime)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <div className={classes.iconWrapper8}>
                    <AccessAlarmIcon style={{ fontSize: 25 }} />
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* ESPERA */}
          <Grid item xs={gridXS} sm={gridSM} md={gridMD}>
            <Paper className={`${classes.card} ${classes.card9}`} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography variant="h7" component="h3" paragraph>
                    Espera
                  </Typography>
                  <Typography variant="h7" component="h3">
                    {formatTime(counters.avgWaitTime)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <div className={classes.iconWrapper9}>
                    <TimerIcon style={{ fontSize: 25 }} />
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* EMPRESAS (para usuário "super") */}
          {user.super && (
            <Grid item xs={gridXS} sm={gridSM} md={gridMD}>
              <Paper className={`${classes.card} ${classes.card00}`} elevation={4}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Typography variant="h7" component="h3" paragraph>
                      Empresas
                    </Typography>
                    <Typography variant="h7" component="h3">
                      {counters.totalCompanies}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <div className={classes.iconWrapper00}>
                      <StoreIcon style={{ fontSize: 25 }} />
                    </div>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* CONEXÕES (para usuário "super") */}
          {user.super && (
            <Grid item xs={gridXS} sm={gridSM} md={gridMD}>
              <Paper className={`${classes.card} ${classes.card0}`} elevation={4}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Typography variant="h7" component="h3" paragraph>
                      Conexões
                    </Typography>
                    <Typography variant="h7" component="h3">
                      {counters.totalWhatsappSessions}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <div className={classes.iconWrapper0}>
                      <MobileFriendlyIcon style={{ fontSize: 25 }} />
                    </div>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* VENCIMENTO */}
          <Grid item xs={gridXS} sm={gridSM} md={gridMD}>
            <Paper className={`${classes.card} ${classes.card10}`} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography variant="h7" component="h3" paragraph>
                    Vencimento
                  </Typography>
                  <Typography variant="h7" component="h3">
                    {companyDueDate}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <div className={classes.iconWrapper10}>
                    <TodayIcon style={{ fontSize: 25 }} />
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* CARD DE GRÁFICO */}
          <Grid item xs={12}>
            <Paper elevation={6} className={classes.fixedHeightPaper}>
              <Chart dateStartTicket={dateStartTicket} dateEndTicket={dateEndTicket} queueTicket={queueTicket} />
            </Paper>
          </Grid>

          {/* Tabela de status dos atendentes */}
          <Grid item xs={12}>
            {attendants.length ? (
              <TableAttendantsStatus attendants={attendants} loading={loading} />
            ) : null}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
