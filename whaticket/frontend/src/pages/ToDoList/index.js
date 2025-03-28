import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  Typography,
  Grid,
  Checkbox,
} from '@material-ui/core';
import { Delete as DeleteIcon, Edit as EditIcon, CheckCircle as CompleteIcon } from '@material-ui/icons';
import api from '../../services/api';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: '2rem auto',
    padding: '2rem',
    maxWidth: '95%', // Ajusta a largura para quase toda a tela
    width: '100%', // Ocupa toda a largura disponível
    backgroundColor: theme.palette.type === 'dark' ? '#151718' : theme.palette.background.default,
    color: theme.palette.text.primary,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  inputContainer: {
    marginBottom: '1.5rem',
  },
  taskInput: {
    marginBottom: '0.5rem',
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.type === 'dark' ? '#151718' : '#F8F8F8',
      '& fieldset': {
        borderColor: theme.palette.divider,
      },
    },
    '& .MuiOutlinedInput-input': {
      color: theme.palette.text.primary,
    },
  },
  button: {
    marginTop: '1rem',
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  listContainer: {
    marginTop: '2rem',
  },
  taskItem: {
    backgroundColor: theme.palette.type === 'dark' ? '#424242' : '#fff',
    marginBottom: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  completed: {
    backgroundColor: theme.palette.success.light + " !important",
  },
  error: {
    color: theme.palette.error.main,
    marginBottom: '1rem',
  },
  description: {
    marginTop: '4px',
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
}));


const ToDoList = () => {
  const classes = useStyles();

  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      setError('Erro ao buscar tarefas. Verifique sua conexão.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddOrEditTask = async () => {
    if (!task.trim()) {
      setError('O nome da tarefa é obrigatório.');
      return;
    }
    setError('');
    const now = new Date();

    if (editIndex >= 0) {
      const updatedTask = { ...tasks[editIndex], text: task, description };
      try {
        await api.put(`/tasks/${updatedTask.id}`, updatedTask);
        const updatedTasks = [...tasks];
        updatedTasks[editIndex] = updatedTask;
        setTasks(updatedTasks);
        setTask('');
        setDescription('');
        setEditIndex(-1);
      } catch {
        setError('Erro ao atualizar a tarefa.');
      }
    } else {
      const newTask = { text: task, description, created_at: now, completed: false };
      try {
        const response = await api.post('/tasks', newTask);
        newTask.id = response.data.id;
        setTasks([...tasks, newTask]);
        setTask('');
        setDescription('');
      } catch {
        setError('Erro ao criar a tarefa.');
      }
    }
  };

  const handleEditTask = (index) => {
    setTask(tasks[index].text);
    setDescription(tasks[index].description);
    setEditIndex(index);
  };

  const handleDeleteTask = async (index) => {
    const taskId = tasks[index].id;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((_, i) => i !== index));
    } catch {
      setError('Erro ao excluir a tarefa.');
    }
  };

  const toggleTaskCompletion = async (index) => {
    const taskToUpdate = tasks[index];
    try {
      await api.put(`/tasks/${taskToUpdate.id}`, { completed: !taskToUpdate.completed });
  
      // Atualiza a lista de tarefas no frontend
      const updatedTasks = tasks.map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      );
  
      setTasks(updatedTasks);
    } catch {
      setError('Erro ao marcar a tarefa como concluída.');
    }
  };

  return (
    <div className={classes.root}>
      <Typography variant="h5" gutterBottom>
        Gerenciador de Tarefas
      </Typography>
      <Grid container spacing={2} className={classes.inputContainer}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            label="Título da Tarefa"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className={classes.taskInput}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" fullWidth onClick={handleAddOrEditTask}>
            {editIndex >= 0 ? 'Salvar Alterações' : 'Adicionar Tarefa'}
          </Button>
        </Grid>
      </Grid>
      {error && <Typography className={classes.error}>{error}</Typography>}
      <div className={classes.listContainer}>
        <List>
          {tasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <ListItem className={`${classes.taskItem} ${task.completed ? classes.completed : ''}`}>
                <Checkbox
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(index)}
                  icon={<CompleteIcon />}
                />
                <ListItemText
                  primary={task.text}
                  secondary={
                    <>
                      {task.created_at && new Date(task.created_at).toLocaleString()}
                      <Typography variant="body2" className={classes.description}>
                        {task.description || 'Sem descrição disponível'}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleEditTask(index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteTask(index)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </div>
    </div>
  );
};

export default ToDoList;
