import png from './test.png';
import php from './php';
import csv from './csv';
import css from './css';
import { pickNRandom } from './utils';

const message = `11:59:04.674 [TestNG-tests-2] ERROR c.e.t.r.q.w.c.FailureLoggingListener - Configuration clearCreatedObjects has been failed with exception com.epam.ta.client.exception.ReportPortalClientException: Report Portal returned error
Status code: 404
Status message:
Error Message: Project 'test_project_2yxr1vdyry' not found. Did you use correct project name?
Error Type: PROJECT_NOT_FOUND
Stack Trace:
	at com.epam.ta.client.service.ReportPortalErrorHandler.handleClientError(ReportPortalErrorHandler.java:47)
	at com.epam.ta.restclient.endpoint.DefaultErrorHandler.handle(DefaultErrorHandler.java:73)
	at com.epam.ta.restclient.endpoint.DefaultErrorHandler.handle(DefaultErrorHandler.java:40)
	at com.epam.ta.restclient.endpoint.HttpClientRestEndpoint.executeInternal(HttpClientRestEndpoint.java:322)
	at com.epam.ta.restclient.endpoint.HttpClientRestEndpoint.delete(HttpClientRestEndpoint.java:181)
	at com.epam.ta.client.service.ReportPortalService.deleteProject(ReportPortalService.java:712)
	at com.epam.ta.reportportal.qa.ws.core.BatchedReportPortalServiceInterceptor.cleanOldProjects(BatchedReportPortalServiceInterceptor.java:383)
	at com.epam.ta.reportportal.qa.ws.core.BatchedReportPortalServiceInterceptor.cleanProjects(BatchedReportPortalServiceInterceptor.java:372)
	at com.epam.ta.reportportal.qa.ws.core.BatchedReportPortalServiceInterceptor.clear(BatchedReportPortalServiceInterceptor.java:248)
	at com.epam.ta.reportportal.qa.ws.factory.ReportPortalServiceFactory.clear(ReportPortalServiceFactory.java:116)
	at com.epam.ta.reportportal.qa.ws.tests.BaseReportPortalTest.clearCreatedObjects(BaseReportPortalTest.java:61)
	at sun.reflect.GeneratedMethodAccessor146.invoke(Unknown Source)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.lang.reflect.Method.invoke(Method.java:498)
	at org.testng.internal.MethodInvocationHelper.invokeMethod(MethodInvocationHelper.java:108)
	at org.testng.internal.Invoker.invokeConfigurationMethod(Invoker.java:523)
	at org.testng.internal.Invoker.invokeConfigurations(Invoker.java:224)
	at org.testng.internal.Invoker.invokeConfigurations(Invoker.java:146)
	at org.testng.internal.TestMethodWorker.invokeAfterClassMethods(TestMethodWorker.java:212)
	at org.testng.internal.TestMethodWorker.run(TestMethodWorker.java:112)
	at org.testng.TestRunner.privateRun(TestRunner.java:744)
	at org.testng.TestRunner.run(TestRunner.java:602)
	at org.testng.SuiteRunner.runTest(SuiteRunner.java:380)
	at org.testng.SuiteRunner.access$000(SuiteRunner.java:39)
	at org.testng.SuiteRunner$SuiteWorker.run(SuiteRunner.java:414)
	at org.testng.internal.thread.ThreadUtil$1.call(ThreadUtil.java:52)
	at java.util.concurrent.FutureTask.run(FutureTask.java:266)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)
	at java.lang.Thread.run(Thread.java:748)`;

const attachments = [
  {
    id: '5b83fa4497a1c00001150f3b',
    binary_content: {
      id: '5b83fa4497a1c00001150f20',
      thumbnail_id: '5b83fa4497a1c00001150f20',
      content_type: 'application/zip',
    },
    message,
    pageNumber: 1,
    pageIndex: 3,
  },
  {
    id: '5b83fa4497a1c00001150f3c',
    binary_content: {
      id: '5b83fa4497a1c00001150f22',
      thumbnail_id: '5b83fa4497a1c00001150f22',
      content_type: 'application/pdf',
    },
    message,
    pageNumber: 1,
    pageIndex: 4,
  },
  {
    id: '5b83fa4397a1c00001150e23',
    binary_content: {
      id: '5b83fa4397a1c00001150e13',
      thumbnail_id: '5b83fa4397a1c00001150e13',
      content_type: 'text/csv',
    },
    message,
    pageNumber: 1,
    pageIndex: 1,
  },
  {
    id: '5b83fa4397a1c00001150e29',
    binary_content: {
      id: '5b83fa4397a1c00001150e15',
      thumbnail_id: '5b83fa4397a1c00001150e17',
      content_type: 'image/png',
    },
    message,
    pageNumber: 1,
    pageIndex: 2,
  },
  {
    id: '5b83fa4397a1c00001150e31',
    binary_content: {
      id: '5b83fa4397a1c00001150e19',
      thumbnail_id: '5b83fa4397a1c00001150e19',
      content_type: 'text/css',
    },
    message,
    pageNumber: 1,
    pageIndex: 3,
  },
  {
    id: '5b83fa4397a1c00001150e32',
    binary_content: {
      id: '5b83fa4397a1c00001150e1b',
      thumbnail_id: '5b83fa4397a1c00001150e1b',
      content_type: 'text/x-php',
    },
    message,
    pageNumber: 1,
    pageIndex: 4,
  },
];

const data = {
  '5b83fa4397a1c00001150e13': csv,
  '5b83fa4397a1c00001150e15': png,
  '5b83fa4397a1c00001150e19': css,
  '5b83fa4397a1c00001150e32': php,
};

const generateFakeAttachments = (page, count) => pickNRandom(attachments, count);

const generateFakeAttachmentContent = (id) => data[id] || '<some binary data placeholder>';

export { generateFakeAttachments, generateFakeAttachmentContent };
