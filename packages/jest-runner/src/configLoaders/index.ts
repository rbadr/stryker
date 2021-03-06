import { tokens, commonTokens, Injector, PluginContext } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';

import { JestRunnerOptionsWithStrykerOptions } from '../JestRunnerOptionsWithStrykerOptions';
import { loaderToken, resolveToken, projectRootToken } from '../pluginTokens';

import CustomJestConfigLoader from './CustomJestConfigLoader';
import ReactScriptsJestConfigLoader from './ReactScriptsJestConfigLoader';
import ReactScriptsTSJestConfigLoader from './ReactScriptsTSJestConfigLoader';

configLoaderFactory.inject = tokens(commonTokens.options, commonTokens.injector, commonTokens.logger);
export function configLoaderFactory(options: StrykerOptions, injector: Injector<PluginContext>, log: Logger) {
  const warnAboutConfigFile = (projectType: string, configFile: string | undefined) => {
    if (configFile) {
      log.warn(`Config setting "configFile" is not supported for projectType "${projectType}"`);
    }
  };
  const optionsWithJest: JestRunnerOptionsWithStrykerOptions = options as JestRunnerOptionsWithStrykerOptions;

  const configLoaderInjector = injector
    .provideValue(loaderToken, require)
    .provideValue(resolveToken, require.resolve)
    .provideValue(projectRootToken, process.cwd());

  switch (optionsWithJest.jest.projectType) {
    case 'custom':
      return configLoaderInjector.injectClass(CustomJestConfigLoader);
    case 'create-react-app':
      warnAboutConfigFile(optionsWithJest.jest.projectType, optionsWithJest.jest.configFile);
      return configLoaderInjector.injectClass(ReactScriptsJestConfigLoader);
    case 'create-react-app-ts':
      warnAboutConfigFile(optionsWithJest.jest.projectType, optionsWithJest.jest.configFile);
      return configLoaderInjector.injectClass(ReactScriptsTSJestConfigLoader);
    default:
      throw new Error(`No configLoader available for ${optionsWithJest.jest.projectType}`);
  }
}
