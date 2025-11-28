import Toast from 'react-native-toast-message';

export const handleApiError = (error: any, context: string = 'Action') => {
  console.error(`${context} error:`, error);

  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const message = error.response.data?.error || error.response.data?.message;

    if (status === 401) {
      Toast.show({
        type: 'error',
        text1: 'Not Authorized',
        text2: 'Please sign in again',
        position: 'top',
      });
    } else if (status === 404) {
      Toast.show({
        type: 'error',
        text1: 'Not Found',
        text2: 'The requested content doesn\'t exist',
        position: 'top',
      });
    } else if (status === 500) {
      Toast.show({
        type: 'error',
        text1: 'Server Error',
        text2: 'Something went wrong on our end',
        position: 'top',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: `${context} Failed`,
        text2: message || 'Please try again',
        position: 'top',
      });
    }
  } else if (error.request) {
    // Network error - no response received
    Toast.show({
      type: 'error',
      text1: 'Network Error',
      text2: 'Check your internet connection',
      position: 'top',
    });
  } else {
    // Something else went wrong
    Toast.show({
      type: 'error',
      text1: `${context} Failed`,
      text2: error.message || 'An unexpected error occurred',
      position: 'top',
    });
  }
};

