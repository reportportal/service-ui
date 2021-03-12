/*
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const state = {
  log: {
    stackTrace: {
      loading: false,
      pagination: {
        number: 1,
        size: 5,
        totalElements: 2,
        totalPages: 1,
      },
      content: [
        {
          id: 1064386,
          time: 1614667072968,
          message:
            '14:05:56.621 [TestNG-tests-1] ERROR o.s.test.context.TestContextManager - Caught exception while allowing TestExecutionListener [org.springframework.test.context.support.DependencyInjectionTestExecutionListener@7398c5e9] to prepare test instance [com.epam.ta.reportportal.qa.ws.tests.email_settings.EmailServerSettingsTest@5cc5b667]\njava.lang.IllegalStateException: Failed to load ApplicationContext\n\tat org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContext(DefaultCacheAwareContextLoaderDelegate.java:124)\n\tat org.springframework.test.context.support.DefaultTestContext.getApplicationContext(DefaultTestContext.java:83)\n\tat org.springframework.test.context.support.DependencyInjectionTestExecutionListener.injectDependencies(DependencyInjectionTestExecutionListener.java:117)\n\tat org.springframework.test.context.support.DependencyInjectionTestExecutionListener.prepareTestInstance(DependencyInjectionTestExecutionListener.java:83)\n\tat org.springframework.test.context.TestContextManager.prepareTestInstance(TestContextManager.java:228)\n\tat org.springframework.test.context.testng.AbstractTestNGSpringContextTests.springTestContextPrepareTestInstance(AbstractTestNGSpringContextTests.java:149)\n\tat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\n\tat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)\n\tat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\n\tat java.lang.reflect.Method.invoke(Method.java:498)\n\tat org.testng.internal.MethodInvocationHelper.invokeMethod(MethodInvocationHelper.java:108)\n\tat org.testng.internal.Invoker.invokeConfigurationMethod(Invoker.java:523)\n\tat org.testng.internal.Invoker.invokeConfigurations(Invoker.java:224)\n\tat org.testng.internal.Invoker.invokeConfigurations(Invoker.java:146)\n\tat org.testng.internal.TestMethodWorker.invokeBeforeClassMethods(TestMethodWorker.java:166)\n\tat org.testng.internal.TestMethodWorker.run(TestMethodWorker.java:105)\n\tat org.testng.TestRunner.privateRun(TestRunner.java:744)\n\tat org.testng.TestRunner.run(TestRunner.java:602)\n\tat org.testng.SuiteRunner.runTest(SuiteRunner.java:380)\n\tat org.testng.SuiteRunner.access$000(SuiteRunner.java:39)\n\tat org.testng.SuiteRunner$SuiteWorker.run(SuiteRunner.java:414)\n\tat org.testng.internal.thread.ThreadUtil$1.call(ThreadUtil.java:52)\n\tat java.util.concurrent.FutureTask.run(FutureTask.java:266)\n\tat java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)\n\tat java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)\n\tat java.lang.Thread.run(Thread.java:748)',
          level: 'ERROR',
          itemId: 553064,
        },
        {
          id: 1064381,
          time: 1614667072968,
          message:
            "11:59:05.823 [TestNG-tests-1] ERROR c.e.t.r.q.w.c.FailureLoggingListener - Test createExternalSystemUnableInteractWithExternalSystem has been failed with exception org.testng.TestException:\nIncorrect Error Type. Expected: UNABLE_INTERACT_WITH_EXTERNAL_SYSTEM, but was 'PROJECT_NOT_FOUND'.\nIncorrect status code. Expected '409, but was '404'",
          level: 'FATAL',
          itemId: 553064,
        },
        {
          id: 1063573,
          time: 1614667070953,
          message:
            "11:59:05.823 [TestNG-tests-1] ERROR c.e.t.r.q.w.c.FailureLoggingListener - Test createExternalSystemUnableInteractWithExternalSystem has been failed with exception org.testng.TestException:\nIncorrect Error Type. Expected: UNABLE_INTERACT_WITH_EXTERNAL_SYSTEM, but was 'PROJECT_NOT_FOUND'.\nIncorrect status code. Expected '409, but was '404'",
          level: 'FATAL',
          itemId: 553008,
        },
        {
          id: 1063568,
          time: 1614667070953,
          message:
            '13:06:43.332 [main] ERROR c.e.t.r.q.w.c.FailureLoggingListener - Test launchMixedItemsStatusTest has been failed with exception com.epam.ta.restclient.endpoint.exception.SerializerException: Unable to deserialize content \'{"error":"invalid_token","error_description":"f795e680-9a44-424e-8d1b-b29f1b7b4f1c"}\' to type \'com.epam.ta.model.ErrorRS\'\n\tat com.epam.ta.restclient.serializer.Jackson2Serializer.deserialize(Jackson2Serializer.java:79)\n\tat com.epam.ta.client.service.ReportPortalErrorHandler.deserializeError(ReportPortalErrorHandler.java:56)\n\tat com.epam.ta.client.service.ReportPortalErrorHandler.handleClientError(ReportPortalErrorHandler.java:47)\n\tat com.epam.ta.restclient.endpoint.DefaultErrorHandler.handle(DefaultErrorHandler.java:73)\n\tat com.epam.ta.restclient.endpoint.DefaultErrorHandler.handle(DefaultErrorHandler.java:40)\n\tat com.epam.ta.restclient.endpoint.HttpClientRestEndpoint.executeInternal(HttpClientRestEndpoint.java:322)\n\tat com.epam.ta.restclient.endpoint.HttpClientRestEndpoint.post(HttpClientRestEndpoint.java:82)\n\tat com.epam.ta.client.service.ReportPortalService.startLaunch(ReportPortalService.java:69)\n\tat sun.reflect.GeneratedMethodAccessor117.invoke(Unknown Source)\n\tat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\n\tat java.lang.reflect.Method.invoke(Method.java:498)\n\tat org.springframework.aop.support.AopUtils.invokeJoinpointUsingReflection(AopUtils.java:302)\n\tat org.springframework.aop.framework.ReflectiveMethodInvocation.invokeJoinpoint(ReflectiveMethodInvocation.java:190)\n\tat org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:157)\n\tat com.epam.ta.reportportal.qa.ws.core.BatchedReportPortalServiceInterceptor.invoke(BatchedReportPortalServiceInterceptor.java:85)\n\tat org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:179)\n\tat org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:208)\n\tat com.sun.proxy.$Proxy99.startLaunch(Unknown Source)\n\tat com.epam.ta.reportportal.qa.ws.tests.launch.LaunchStatusTest.finishMixedLaunch(LaunchStatusTest.java:113)\n\tat com.epam.ta.reportportal.qa.ws.tests.launch.LaunchStatusTest.launchMixedItemsStatusTest(LaunchStatusTest.java:45)\n\tat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\n\tat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)\n\tat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\n\tat java.lang.reflect.Method.invoke(Method.java:498)\n\tat org.testng.internal.MethodInvocationHelper.invokeMethod(MethodInvocationHelper.java:108)\n\tat org.testng.internal.MethodInvocationHelper$1.runTestMethod(MethodInvocationHelper.java:209)\n\tat org.springframework.test.context.testng.AbstractTestNGSpringContextTests.run(AbstractTestNGSpringContextTests.java:175)\n\tat org.testng.internal.MethodInvocationHelper.invokeHookable(MethodInvocationHelper.java:221)\n\tat org.testng.internal.Invoker.invokeMethod(Invoker.java:657)\n\tat org.testng.internal.Invoker.invokeTestMethod(Invoker.java:869)\n\tat org.testng.internal.Invoker.invokeTestMethods(Invoker.java:1193)\n\tat org.testng.internal.TestMethodWorker.invokeTestMethods(TestMethodWorker.java:126)\n\tat org.testng.internal.TestMethodWorker.run(TestMethodWorker.java:109)\n\tat org.testng.TestRunner.privateRun(TestRunner.java:744)\n\tat org.testng.TestRunner.run(TestRunner.java:602)\n\tat org.testng.SuiteRunner.runTest(SuiteRunner.java:380)\n\tat org.testng.SuiteRunner.runSequentially(SuiteRunner.java:375)\n\tat org.testng.SuiteRunner.privateRun(SuiteRunner.java:340)\n\tat org.testng.SuiteRunner.run(SuiteRunner.java:289)\n\tat org.testng.SuiteRunnerWorker.runSuite(SuiteRunnerWorker.java:52)\n\tat org.testng.SuiteRunnerWorker.run(SuiteRunnerWorker.java:86)\n\tat org.testng.TestNG.runSuitesSequentially(TestNG.java:1301)\n\tat org.testng.TestNG.runSuitesLocally(TestNG.java:1226)\n\tat org.testng.TestNG.runSuites(TestNG.java:1144)\n\tat org.testng.TestNG.run(TestNG.java:1115)\n\tat org.apache.maven.surefire.testng.TestNGExecutor.run(TestNGExecutor.java:281)\n\tat org.apache.maven.surefire.testng.TestNGXmlTestSuite.execute(TestNGXmlTestSuite.java:75)\n\tat org.apache.maven.surefire.testng.TestNGProvider.invoke(TestNGProvider.java:121)\n\tat org.apache.maven.surefire.booter.ForkedBooter.invokeProviderInSameClassLoader(ForkedBooter.java:290)\n\tat org.apache.maven.surefire.booter.ForkedBooter.runSuitesInProcess(ForkedBooter.java:242)\n\tat org.apache.maven.surefire.booter.ForkedBooter.main(ForkedBooter.java:121)\nCaused by: com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException: Unrecognized field "error" (class com.epam.ta.model.ErrorRS), not marked as ignorable (3 known properties: "error_code", "stack_trace", "message"])\n at [Source: (byte[])"{"error":"invalid_token","error_description":"f795e680-9a44-424e-8d1b-b29f1b7b4f1c"}"; line: 1, column: 11] (through reference chain: com.epam.ta.model.ErrorRS["error"])\n\tat com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException.from(UnrecognizedPropertyException.java:60)\n\tat com.fasterxml.jackson.databind.DeserializationContext.handleUnknownProperty(DeserializationContext.java:822)\n\tat com.fasterxml.jackson.databind.deser.std.StdDeserializer.handleUnknownProperty(StdDeserializer.java:978)\n\tat com.fasterxml.jackson.databind.deser.BeanDeserializerBase.handleUnknownProperty(BeanDeserializerBase.java:1554)\n\tat com.fasterxml.jackson.databind.deser.BeanDeserializerBase.handleUnknownVanilla(BeanDeserializerBase.java:1532)\n\tat com.fasterxml.jackson.databind.deser.BeanDeserializer.vanillaDeserialize(BeanDeserializer.java:281)\n\tat com.fasterxml.jackson.databind.deser.BeanDeserializer.deserialize(BeanDeserializer.java:139)\n\tat com.fasterxml.jackson.databind.ObjectMapper._readValue(ObjectMapper.java:3916)\n\tat com.fasterxml.jackson.databind.ObjectMapper.readValue(ObjectMapper.java:2197)\n\tat com.fasterxml.jackson.core.JsonParser.readValueAs(JsonParser.java:1696)\n\tat com.epam.ta.restclient.serializer.Jackson2Serializer.deserialize(Jackson2Serializer.java:77)\n\t... 50 more',
          level: 'FATAL',
          itemId: 553008,
        },
        {
          id: 1063441,
          time: 1614667070733,
          message:
            '11:59:18.767 [TestNG-tests-2] ERROR c.e.t.r.q.w.c.FailureLoggingListener - Configuration createProject has been failed with exception java.lang.NullPointerException\n\tat com.epam.ta.reportportal.qa.ws.factory.ReportPortalServiceFactory.getToken(ReportPortalServiceFactory.java:140)\n\tat com.epam.ta.reportportal.qa.ws.factory.ReportPortalServiceFactory.createService(ReportPortalServiceFactory.java:102)\n\tat com.epam.ta.reportportal.qa.ws.factory.RPServicePool.addService(RPServicePool.java:17)\n\tat com.epam.ta.reportportal.qa.ws.factory.RPServicePool.getService(RPServicePool.java:22)\n\tat com.epam.ta.reportportal.qa.ws.testdata.handlers.ProjectTestDataHandler.createEntity(ProjectTestDataHandler.java:33)\n\tat com.epam.ta.reportportal.qa.ws.tests.filtering.BaseGlteTest.createProject(BaseGlteTest.java:39)\n\tat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\n\tat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)\n\tat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\n\tat java.lang.reflect.Method.invoke(Method.java:498)\n\tat org.testng.internal.MethodInvocationHelper.invokeMethod(MethodInvocationHelper.java:108)\n\tat org.testng.internal.Invoker.invokeConfigurationMethod(Invoker.java:523)\n\tat org.testng.internal.Invoker.invokeConfigurations(Invoker.java:224)\n\tat org.testng.internal.Invoker.invokeConfigurations(Invoker.java:146)\n\tat org.testng.internal.TestMethodWorker.invokeBeforeClassMethods(TestMethodWorker.java:166)\n\tat org.testng.internal.TestMethodWorker.run(TestMethodWorker.java:105)\n\tat org.testng.TestRunner.privateRun(TestRunner.java:744)\n\tat org.testng.TestRunner.run(TestRunner.java:602)\n\tat org.testng.SuiteRunner.runTest(SuiteRunner.java:380)\n\tat org.testng.SuiteRunner.access$000(SuiteRunner.java:39)\n\tat org.testng.SuiteRunner$SuiteWorker.run(SuiteRunner.java:414)\n\tat org.testng.internal.thread.ThreadUtil$1.call(ThreadUtil.java:52)\n\tat java.util.concurrent.FutureTask.run(FutureTask.java:266)\n\tat java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)\n\tat java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)\n\tat java.lang.Thread.run(Thread.java:748)',
          level: 'FATAL',
          itemId: 553001,
        },
        {
          id: 1063438,
          time: 1614667070733,
          message:
            "11:59:05.791 [TestNG-tests-1] ERROR c.e.t.r.q.w.c.FailureLoggingListener - Test createExternalSystemUnableInteractWithExternalSystem has been failed with exception org.testng.TestException:\nIncorrect Error Type. Expected: UNABLE_INTERACT_WITH_EXTERNAL_SYSTEM, but was 'PROJECT_NOT_FOUND'.\nIncorrect status code. Expected '409, but was '404'\n\tat com.epam.ta.reportportal.qa.ws.core.ExpectedExceptionListener.checkReportPortalException(ExpectedExceptionListener.java:130)\n\tat com.epam.ta.reportportal.qa.ws.core.ExpectedExceptionListener.afterInvocation(ExpectedExceptionListener.java:63)\n\tat org.testng.internal.invokers.InvokedMethodListenerInvoker$InvokeAfterInvocationWithoutContextStrategy.callMethod(InvokedMethodListenerInvoker.java:100)\n\tat org.testng.internal.invokers.InvokedMethodListenerInvoker.invokeListener(InvokedMethodListenerInvoker.java:62)\n\tat org.testng.internal.Invoker.runInvokedMethodListeners(Invoker.java:566)\n\tat org.testng.internal.Invoker.invokeMethod(Invoker.java:713)\n\tat org.testng.internal.Invoker.invokeTestMethod(Invoker.java:869)\n\tat org.testng.internal.Invoker.invokeTestMethods(Invoker.java:1193)\n\tat org.testng.internal.TestMethodWorker.invokeTestMethods(TestMethodWorker.java:126)\n\tat org.testng.internal.TestMethodWorker.run(TestMethodWorker.java:109)\n\tat org.testng.TestRunner.privateRun(TestRunner.java:744)\n\tat org.testng.TestRunner.run(TestRunner.java:602)\n\tat org.testng.SuiteRunner.runTest(SuiteRunner.java:380)\n\tat org.testng.SuiteRunner.access$000(SuiteRunner.java:39)\n\tat org.testng.SuiteRunner$SuiteWorker.run(SuiteRunner.java:414)\n\tat org.testng.internal.thread.ThreadUtil$1.call(ThreadUtil.java:52)\n\tat java.util.concurrent.FutureTask.run(FutureTask.java:266)\n\tat java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)\n\tat java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)\n\tat java.lang.Thread.run(Thread.java:748)",
          level: 'FATAL',
          itemId: 553001,
        },
      ],
    },
    attachments: {
      logsWithAttachments: [],
      pagination: {},
      loading: false,
      activeAttachmentId: 0,
    },
    sauceLabs: {
      authToken: '',
      assets: {},
      jobInfo: {},
      logs: [],
      loading: false,
    },
  },
  project: {
    info: {
      configuration: {
        subTypes: {
          TO_INVESTIGATE: [
            {
              id: 1,
              locator: 'ti001',
              typeRef: 'TO_INVESTIGATE',
              longName: 'To Investigate',
              shortName: 'TI',
              color: '#ffb743',
            },
          ],
        },
      },
    },
  },
};

export const item = {
  id: 552853,
  uuid: 'fc07c062-aa41-4988-b574-fa0244775053',
  name: 'UpdateLaunchTest',
  codeRef: 'com.epam.ta.reportportal.demodata.UpdateLaunchTest',
  parameters: [],
  attributes: [],
  type: 'STEP',
  startTime: 1614667067279,
  endTime: 1614667068146,
  status: 'FAILED',
  statistics: {
    executions: { total: 1, failed: 1 },
    defects: { to_investigate: { total: 1, ti001: 1 } },
  },
  parent: 552707,
  pathNames: {
    launchPathName: { name: 'Demo Api Tests', number: 181 },
    itemPaths: [
      { id: 552704, name: 'Launch Tests' },
      { id: 552707, name: 'Test with nested steps' },
    ],
  },
  issue: {
    issueType: 'ti001',
    comment:
      'Should be marked with custom defect type\n[lol](https://lol.com)\n[lol](vscode://lol.com)',
    autoAnalyzed: false,
    ignoreAnalyzer: false,
    externalSystemIssues: [
      {
        ticketId: 'EPMRPP-60348',
        btsUrl: 'https://jiraeu-api.epam.com',
        btsProject: 'EPMRPP',
        url: 'https://jiraeu.epam.com/browse/EPMRPP-60348',
      },
    ],
  },
  hasChildren: false,
  hasStats: true,
  launchId: 168305,
  uniqueId: 'auto:710a46edcd2e7f341ff1e7bc34388395',
  testCaseId: 'com.epam.ta.reportportal.demodata.UpdateLaunchTest',
  testCaseHash: 525516344,
  patternTemplates: ['error'],
  path: '552704.552707.552853',
  launchNumber: 181,
};
