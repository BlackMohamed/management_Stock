const { spawn } = require('child_process');

const sparkAnalytics = (jobType, params = {}) => {
  return new Promise((resolve, reject) => {
    const sparkJob = spawn('spark-submit', ['./spark_jobs/analytics.py', jobType, JSON.stringify(params)]);
    let result = '';
    sparkJob.stdout.on('data', (data) => { result += data.toString(); });
    sparkJob.stderr.on('data', (data) => { console.error(`Spark error: ${data}`); });
    sparkJob.on('close', (code) => {
      if (code === 0) resolve(JSON.parse(result));
      else reject(new Error('Spark job failed'));
    });
  });
};

module.exports = { sparkAnalytics };