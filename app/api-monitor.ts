export class APIMonitor {
  private static requestCount = 0;
  private static failedRequests: Array<{
    url: string;
    error: string;
    timestamp: string;
  }> = [];

  static incrementRequest() {
    this.requestCount++;
  }

  static decrementRequest() {
    this.requestCount--;
  }

  static addFailedRequest(url: string, error: string) {
    this.failedRequests.push({
      url,
      error,
      timestamp: new Date().toISOString()
    });

    // 只保留最近的50条错误记录
    if (this.failedRequests.length > 50) {
      this.failedRequests.shift();
    }
  }

  static getStatus() {
    return {
      activeRequests: this.requestCount,
      failedRequests: this.failedRequests
    };
  }

  static clearFailedRequests() {
    this.failedRequests = [];
  }
}
