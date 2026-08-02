import  { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './app/store';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppRouter } from './routes/AppRouter';
import { fetchCurrentUser, initializeAuth } from './store/slices/authSlice';
import { Toaster } from 'react-hot-toast';

const AppContent = () => {
  const dispatch = useDispatch(); //for sending instruction to the redux
  const { accessToken} = useSelector((state) => state.auth);  //reading authentication data from redux

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchCurrentUser())
        .unwrap()  //it makes an asyncthunk to behave like a normal JS promise (async thunk is basically a Redux Function used when an action needs extra logic or an API call before state can be updated in the Redux.)
        .catch(() => {
          // Token is expired/invalid
          dispatch(initializeAuth());
        });
    } else {
      dispatch(initializeAuth());
    }
  }, [dispatch, accessToken]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-slate-900 dark:text-white dark:border dark:border-slate-800',
          duration: 4000,
        }}
      />
      <AppRouter />
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
