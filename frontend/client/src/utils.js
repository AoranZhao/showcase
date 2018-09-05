'use strict';

import path from 'path';
import Axios from 'axios';

const API_ADDRESS = process.env.DEFAULT_AXIOS_ADDRESS || 'http://localhost:2978';

Axios.defaults.baseURL = API_ADDRESS;
export { Axios };
