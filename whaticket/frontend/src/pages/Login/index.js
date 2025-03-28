import React, { useContext, useState, useEffect } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import {
  Container,
  CssBaseline,
  TextField,
  Button,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { AuthContext } from '../../context/Auth/AuthContext';
import { i18n } from '../../translate/i18n';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import api from '../../services/api';

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  leftContainer: {
    width: "70%",
    background: `url(${process.env.REACT_APP_BACKEND_URL}/public/logotipos/banner-login.png)`,
    backgroundSize: "cover",
    backgroundColor: theme.palette.background.paper,
    marginRight: "-4px",
    backgroundPosition: "center",
    [theme.breakpoints.down('sm')]: {
      display: "none",
    },
  },
  rightContainer: {
    width: "30%",
    display: "flex",
    justifyContent: "center",
    backgroundColor: theme.palette.background.paper,
    alignItems: "center",
    padding: theme.spacing(2),
    marginRight: "4px",
    [theme.breakpoints.down('sm')]: {
      width: "100%",
    },
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    borderRadius: "10px",
    width: "100%",
    maxWidth: "400px",
  },
  logo: {
    margin: "0 auto",
    width: "80%",
    marginBottom: theme.spacing(2),
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(2, 0, 1),
    borderRadius: "7px",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    textTransform: "none",
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  captchaField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  signUpContainer: {
    marginTop: theme.spacing(2),
    textAlign: 'center',
  },
  createAccountButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.primary.main,
    textTransform: 'none',
    marginTop: theme.spacing(1),
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const Login = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { handleLogin } = useContext(AuthContext);

  // Estados do usuário
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Estados para configurações de registro
  const [allowregister, setAllowRegister] = useState('disabled');
  const [viewregister, setViewRegister] = useState('disabled');

  // Estados para banner e logo (cache-bypass)
  const [randomValue, setRandomValue] = useState("");
  useEffect(() => {
    setRandomValue(Math.random());
  }, []);
  const logo = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/login.png`;
  const logoWithRandom = `${logo}?r=${randomValue}`;
  const bannerUrl = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/banner-login.png?r=${randomValue}`;

  // Recupera dados salvos (remember-me)
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail) {
      setUser(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
    if (savedPassword) {
      setUser(prev => ({ ...prev, password: savedPassword }));
    }
  }, []);

  // Estado para a configuração do CAPTCHA (obtido do backend, ex: "enabled" ou "disabled")
  const [captchaConfig, setCaptchaConfig] = useState(null);
  // Estados para o desafio de CAPTCHA
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

  // Busca a configuração do CAPTCHA (exemplo: se o captcha está ativado)
  useEffect(() => {
    const fetchCaptchaConfig = async () => {
      try {
        const responseCaptcha = await api.get("/settings/captcha");
        setCaptchaConfig(responseCaptcha.data.value);
      } catch (error) {
        console.error('Error fetching captcha configuration:', error);
        setCaptchaConfig("disabled"); // fallback
      }
    };
    fetchCaptchaConfig();
  }, []);

  // Se o CAPTCHA estiver ativado, busca o desafio via backend
  useEffect(() => {
    if (captchaConfig === "enabled") {
      const fetchCaptcha = async () => {
        try {
          setCaptchaLoading(true);
          const response = await api.get("/captcha"); // Endpoint que gera o desafio
          setCaptchaToken(response.data.token);
          setCaptchaQuestion(response.data.question);
          setCaptchaAnswer("");
          setCaptchaLoading(false);
        } catch (error) {
          console.error("Erro ao carregar CAPTCHA:", error);
          setCaptchaLoading(false);
        }
      };
      fetchCaptcha();
    }
  }, [captchaConfig]);

  // Busca configurações de registro (para exibir ou ocultar o link de cadastro)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const responseAllow = await api.get("/settings/allowregister");
        setAllowRegister(responseAllow.data.value);
        const responseView = await api.get("/settings/viewregister");
        setViewRegister(responseView.data.value);
        // Se o registro estiver desativado, pode redirecionar ou agir conforme sua lógica
        // Exemplo: if (responseAllow.data.value === 'disabled') history.push("/login");
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, [history]);

  const handleChangeInput = e => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleRememberMeChange = e => {
    setRememberMe(e.target.checked);
  };

  const handleCaptchaInputChange = e => {
    setCaptchaAnswer(e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Se o CAPTCHA estiver ativado, valida-o via backend
    if (captchaConfig === "enabled") {
      try {
        const captchaValidation = await api.post("/captcha/validate", {
          token: captchaToken,
          answer: captchaAnswer
        });
        if (!captchaValidation.data.success) {
          alert("Falha na validação do CAPTCHA. Tente novamente.");
          // Recarrega o desafio em caso de falha
          const response = await api.get("/captcha");
          setCaptchaToken(response.data.token);
          setCaptchaQuestion(response.data.question);
          setCaptchaAnswer("");
          return;
        }
      } catch (error) {
        console.error("Erro ao validar CAPTCHA:", error);
        alert("Erro ao validar CAPTCHA. Por favor, tente novamente.");
        return;
      }
    }

    // Lógica para "Lembrar-me"
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", user.email);
      localStorage.setItem("rememberedPassword", user.password);
    } else {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedPassword");
    }
    // Efetua o login
    handleLogin(user);
  };

  return (
    <div className={classes.root}>
      <div
        className={classes.leftContainer}
        style={{ backgroundImage: `url(${bannerUrl})` }}
      />
      <div className={classes.rightContainer}>
        <Container className={classes.paper}>
          <CssBaseline />
          <img className={classes.logo} src={logoWithRandom} alt="Logo" />
          <Typography variant="h6" style={{ marginBottom: theme.spacing(1), color: theme.palette.text.primary }}>
            Bem-vindo de Volta! 👋
          </Typography>
          <Typography variant="body2" style={{ marginBottom: theme.spacing(2), color: theme.palette.text.secondary }}>
            Por favor, faça login na sua conta
          </Typography>
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <label htmlFor="email" style={{ color: theme.palette.text.primary, fontWeight: 'bold', marginBottom: '4px' }}>
              Email
            </label>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              name="email"
              autoComplete="email"
              autoFocus
              placeholder="Digite seu e-mail"
              value={user.email}
              onChange={handleChangeInput}
              className={classes.textField}
            />
            <label htmlFor="password" style={{ color: theme.palette.text.primary, fontWeight: 'bold', marginBottom: '4px', marginTop: '16px' }}>
              Senha
            </label>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              value={user.password}
              onChange={handleChangeInput}
              className={classes.textField}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(prev => !prev)}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Grid container justify="space-between" alignItems="center">
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      color="primary"
                    />
                  }
                  label="Lembrar-me"
                />
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/forgetpsw" variant="body2">
                  Esqueceu sua senha?
                </Link>
              </Grid>
            </Grid>

            {/* Renderiza o CAPTCHA somente se a configuração estiver ativa */}
            {captchaConfig === "enabled" && (
              captchaLoading ? (
                <Typography variant="body2" align="center">
                  Carregando CAPTCHA...
                </Typography>
              ) : (
                <TextField
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  size="small"
                  label="Resolva"
                  placeholder={captchaQuestion}
                  value={captchaAnswer}
                  onChange={handleCaptchaInputChange}
                  InputLabelProps={{ style: { fontSize: '0.8rem' } }}
                  className={classes.captchaField}
                  required
                />
              )
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className={classes.submit}
            >
              {i18n.t("login.buttons.submit")}
            </Button>
          </form>

          {/* Exibe o link de cadastro somente se allowregister e viewregister estiverem "enabled" */}
          {allowregister === "enabled" && viewregister === "enabled" && (
            <Container className={classes.signUpContainer} maxWidth="xs">
              <Typography variant="body1" color="textSecondary">
                Ainda não tem uma conta?
              </Typography>
              <Link component={RouterLink} to="/signup" className={classes.createAccountButton}>
                <KeyboardArrowRightIcon style={{ marginRight: 4 }} />
                Criar uma conta
              </Link>
            </Container>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Login;
