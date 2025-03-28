import React, { useEffect, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { head, isArray } from 'lodash';
import moment from 'moment';
import { toast, ToastContainer } from 'react-toastify';
import {
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  TablePagination,
  Tooltip
} from '@material-ui/core';
import { Edit as EditIcon } from '@material-ui/icons';
import LockIcon from '@material-ui/icons/Lock';
import useCompanies from '../../hooks/useCompanies';
import { useDate } from '../../hooks/useDate';
import usePlans from '../../hooks/usePlans';
import api from '../../services/api';
import ButtonWithSpinner from '../ButtonWithSpinner';
import ConfirmationModal from '../ConfirmationModal';
import ModalUsers from '../ModalUsers';
import 'react-toastify/dist/ReactToastify.css';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  mainPaper: {
    width: '100%',
    flex: 1,
    padding: theme.spacing(2),
  },
  fullWidth: {
    width: '100%',
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
    ...theme.scrollbarStyles,
  },
}));

// Função para formatar a data e hora
const formatDate = (date) => moment(date).format('DD/MM/YYYY HH:mm');

export function CompanyForm({ onSubmit, onDelete, onCancel, initialValue, loading }) {
  const classes = useStyles();
  const [plans, setPlans] = useState([]);
  const [modalUser, setModalUser] = useState(false);
  const [firstUser, setFirstUser] = useState({});
  const [record, setRecord] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    planId: '',
    status: true,
    campaignsEnabled: false,
    dueDate: '',
    recurrence: '',
    createdAt: '',
    ...initialValue,
  });

  const { list: listPlans } = usePlans();

  useEffect(() => {
    const fetchPlans = async () => {
      const list = await listPlans();
      setPlans(list);
    };
    fetchPlans();
  }, [listPlans]);

  useEffect(() => {
    setRecord((prev) => {
      if (moment(initialValue.dueDate).isValid()) {
        initialValue.dueDate = moment(initialValue.dueDate).format('YYYY-MM-DD');
      }
      return {
        ...prev,
        ...initialValue,
      };
    });
  }, [initialValue]);

  const handleSubmit = async (data) => {
    const companyData = {
      ...data,
      dueDate: data.dueDate === '' || !moment(data.dueDate).isValid() ? null : data.dueDate,
      createdAt: moment().toISOString(),
    };
    onSubmit(companyData);
    setRecord({ ...initialValue, dueDate: '' });
  };

  const handleOpenModalUsers = async () => {
    try {
      const { data } = await api.get('/users/list', {
        params: {
          companyId: initialValue.id,
        },
      });
      if (isArray(data) && data.length) {
        setFirstUser(head(data));
      }
      setModalUser(true);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleCloseModalUsers = () => {
    setFirstUser({});
    setModalUser(false);
  };

  const incrementDueDate = () => {
    const updatedRecord = { ...record };
    if (updatedRecord.dueDate && moment(updatedRecord.dueDate).isValid()) {
      const incrementMap = {
        MENSAL: 1,
        BIMESTRAL: 2,
        TRIMESTRAL: 3,
        SEMESTRAL: 6,
        ANUAL: 12,
      };
      const increment = incrementMap[updatedRecord.recurrence] || 0;
      updatedRecord.dueDate = moment(updatedRecord.dueDate).add(increment, 'months').format('YYYY-MM-DD');
    }
    setRecord(updatedRecord);
  };

  return (
    <>
      <ModalUsers
        userId={firstUser.id}
        companyId={initialValue.id}
        open={modalUser}
        onClose={handleCloseModalUsers}
      />
      <Formik
        enableReinitialize
        initialValues={record}
        onSubmit={(values, { resetForm }) => {
          handleSubmit(values);
          resetForm();
        }}
      >
        {({ touched, errors }) => (
          <Form className={classes.fullWidth}>
            <Grid container spacing={2} justifyContent="flex-end">
              <Grid item xs={12} sm={6} md={4}>
                <Field
                  as={TextField}
                  label="Nome"
                  name="name"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Field
                  as={TextField}
                  label="E-mail"
                  name="email"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                  required
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Field
                  as={TextField}
                  label="Telefone"
                  name="phone"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                  error={touched.phone && Boolean(errors.phone)}
                  helperText={touched.phone && errors.phone}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="plan-selection">Plano</InputLabel>
                  <Field
                    as={Select}
                    id="plan-selection"
                    label="Plano"
                    labelId="plan-selection-label"
                    name="planId"
                    margin="dense"
                    required
                  >
                    {plans.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="status-selection">Status</InputLabel>
                  <Field
                    as={Select}
                    id="status-selection"
                    label="Status"
                    labelId="status-selection-label"
                    name="status"
                    margin="dense"
                  >
                    <MenuItem value={true}>Sim</MenuItem>
                    <MenuItem value={false}>Não</MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="campaigns-selection">Campanhas</InputLabel>
                  <Field
                    as={Select}
                    id="campaigns-selection"
                    label="Campanhas"
                    labelId="campaigns-selection-label"
                    name="campaignsEnabled"
                    margin="dense"
                  >
                    <MenuItem value={true}>Habilitadas</MenuItem>
                    <MenuItem value={false}>Desabilitadas</MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Field
                  as={TextField}
                  label="Data de Vencimento"
                  type="date"
                  name="dueDate"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                  fullWidth
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="recurrence-selection">Recorrência</InputLabel>
                  <Field
                    as={Select}
                    label="Recorrência"
                    labelId="recurrence-selection-label"
                    id="recurrence"
                    name="recurrence"
                    margin="dense"
                  >
                    <MenuItem value="MENSAL">Mensal</MenuItem>
                    {/* <MenuItem value="BIMESTRAL">Bimestral</MenuItem> */}
                    {/* <MenuItem value="TRIMESTRAL">Trimestral</MenuItem> */}
                    {/* <MenuItem value="SEMESTRAL">Semestral</MenuItem> */}
                    {/* <MenuItem value="ANUAL">Anual</MenuItem> */}
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={1} justifyContent="flex-end">
                  <Grid item xs={4} md={1}>
                    <ButtonWithSpinner
                      className={classes.fullWidth}
                      style={{ marginTop: 7 }}
                      loading={loading}
                      onClick={onCancel}
                      variant="contained"
                    >
                      Limpar
                    </ButtonWithSpinner>
                  </Grid>
                  {record.id && (
                    <>
                      {record.id === 1 ? (
                        <Grid item xs={6} md={1}>
                          <Tooltip
                            title="Por padrão, essa empresa não pode ser excluída."
                            placement="top"
                          >
                            <span>
                              <ButtonWithSpinner
                                style={{ marginTop: 7 }}
                                className={classes.fullWidth}
                                loading={loading}
                                variant="contained"
                                color="secondary"
                                disabled
                              >
                                <LockIcon />
                              </ButtonWithSpinner>
                            </span>
                          </Tooltip>
                        </Grid>
                      ) : (
                        <Grid item xs={6} md={1}>
                          <ButtonWithSpinner
                            style={{ marginTop: 7 }}
                            className={classes.fullWidth}
                            loading={loading}
                            onClick={() => onDelete(record)}
                            variant="contained"
                            color="secondary"
                          >
                            Excluir
                          </ButtonWithSpinner>
                        </Grid>
                      )}
                      <Grid item xs={6} md={2}>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={incrementDueDate}
                          variant="contained"
                          color="primary"
                        >
                          + Vencimento
                        </ButtonWithSpinner>
                      </Grid>
                      <Grid item xs={6} md={1}>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={handleOpenModalUsers}
                          variant="contained"
                          color="primary"
                        >
                          Usuário
                        </ButtonWithSpinner>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={6} md={1}>
                    <ButtonWithSpinner
                      className={classes.fullWidth}
                      style={{ marginTop: 7 }}
                      loading={loading}
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Salvar
                    </ButtonWithSpinner>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
}

export function CompaniesManagerGrid({ records, onSelect }) {
  const classes = useStyles();
  const { dateToClient } = useDate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const renderStatus = (status) => (status ? 'Sim' : 'Não');

  const renderPlan = (planId, plan) => (planId ? plan.name : '-');

  const renderCampaignsStatus = (settings) => {
    const setting = settings.find((s) => s.key === 'campaignsEnabled');
    return setting?.value === 'true' ? 'Habilitadas' : 'Desabilitadas';
  };

  const rowStyle = (dueDate) => {
    if (moment(dueDate).isValid()) {
      const now = moment();
      const due = moment(dueDate);
      const diff = due.diff(now, 'days');
      if (diff === 5) return { backgroundColor: '#fffead' };
      if (diff >= -3 && diff <= 4) return { backgroundColor: '#f7cc8f' };
      if (diff === -4) return { backgroundColor: '#fa8c8c' };
    }
    return {};
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper className={classes.tableContainer}>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="center" style={{ width: '1%' }}>
              #
            </TableCell>
            <TableCell align="left">ID</TableCell>
            <TableCell align="left">Nome</TableCell>
            <TableCell align="left">E-mail</TableCell>
            <TableCell align="left">Telefone</TableCell>
            <TableCell align="left">Plano</TableCell>
            <TableCell align="left">Campanhas</TableCell>
            <TableCell align="left">Status</TableCell>
            <TableCell align="left">Criada Em</TableCell>
            <TableCell align="left">Vencimento</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, key) => (
              <TableRow key={key} style={rowStyle(row.dueDate)}>
                <TableCell align="center" style={{ width: '1%' }}>
                  <IconButton onClick={() => onSelect(row)} aria-label="edit">
                    <EditIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="left">{row.id || '-'}</TableCell>
                <TableCell align="left">{row.name || '-'}</TableCell>
                <TableCell align="left">{row.email || '-'}</TableCell>
                <TableCell align="left">{row.phone || '-'}</TableCell>
                <TableCell align="left">{renderPlan(row.planId, row.plan)}</TableCell>
                <TableCell align="left">{renderCampaignsStatus(row.settings)}</TableCell>
                <TableCell align="left">{renderStatus(row.status)}</TableCell>
                <TableCell align="left">{formatDate(row.createdAt)}</TableCell>
                <TableCell align="left">
                  {dateToClient(row.dueDate)}
                  <br />
                  <span>{row.recurrence}</span>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={records.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default function CompaniesManager() {
  const classes = useStyles();
  const { list, save, update, remove } = useCompanies();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    planId: '',
    status: true,
    campaignsEnabled: false,
    dueDate: '',
    recurrence: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const companyList = await list();
      setRecords(companyList);
    } catch (e) {
      toast.error('Não foi possível carregar a lista de registros');
    }
    setLoading(false);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (data.id) {
        await update(data);
      } else {
        await save(data);
      }
      await loadRecords();
      handleCancel();
      toast.success('Operação realizada com sucesso!');
    } catch (e) {
      toast.error('Não foi possível realizar a operação. Verifique se já existe uma empresa com o mesmo nome ou se os campos foram preenchidos corretamente');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    // Impede a exclusão da empresa com id 1
    if (record.id === 1) {
      toast.warning("Não é possível excluir a empresa padrão.");
      setShowConfirmDialog(false);
      return;
    }
    setLoading(true);
    try {
      await remove(record.id);
      await loadRecords();
      handleCancel();
      toast.success('Operação realizada com sucesso!');
    } catch (e) {
      toast.error('Não foi possível realizar a operação');
    }
    setLoading(false);
  };

  const handleOpenDeleteDialog = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    setRecord({
      id: '',
      name: '',
      email: '',
      phone: '',
      planId: '',
      status: true,
      campaignsEnabled: false,
      dueDate: '',
      recurrence: '',
    });
  };

  const handleSelect = (data) => {
    const campaignsEnabled = data.settings?.some((s) => s.key === 'campaignsEnabled' && (s.value === 'true' || s.value === 'enabled'));
    setRecord({
      id: data.id,
      name: data.name || '',
      phone: data.phone || '',
      email: data.email || '',
      planId: data.planId || '',
      status: data.status !== false,
      campaignsEnabled: campaignsEnabled || false,
      dueDate: data.dueDate || '',
      recurrence: data.recurrence || '',
    });
  };

  const filteredRecords = records.filter((record) =>
    [record.name, record.email, record.phone]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Pesquisar por Nome, E-mail ou Telefone"
            variant="outlined"
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            margin="dense"
          />
        </Grid>
        <Grid item xs={12}>
          <CompanyForm
            initialValue={record}
            onDelete={handleOpenDeleteDialog}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <CompaniesManagerGrid records={filteredRecords} onSelect={handleSelect} />
        </Grid>
      </Grid>
      <ToastContainer />
      <ConfirmationModal
        title="Exclusão de Registro"
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDelete}
      >
        Deseja realmente excluir esse registro?
      </ConfirmationModal>
    </Paper>
  );
}
