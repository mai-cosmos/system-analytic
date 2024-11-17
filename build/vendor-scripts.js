const path = require('./config')
const rollup = require('rollup')
const nodeResolve = require('@rollup/plugin-node-resolve')
const { babel } = require('@rollup/plugin-babel')
const terser = require('@rollup/plugin-terser')
const { ESLint } = require('eslint')
const configureLogger = require('./logger')

const log = configureLogger('Vendor-scripts')

const output = process.argv[2] || 'expanded' // Default to expanded if not provided

const bundleVendorJS = async (output) => {
  log.info('Bundling Vendor-scripts...')
  try {
    const isMinified = output === 'minified'
    const outputFilename = isMinified ? 'vendor.min.js' : 'vendor.js'

    const inputOptions = {
      input: `./${path.vendor_js_input}/vendor.js`,
      plugins: [
        nodeResolve(),
        babel({
          babelHelpers: 'bundled',
          exclude: 'node_modules/**',
        }),
        isMinified && terser({ output: { comments: /^!|@author|@version/i } }),
      ].filter(Boolean),
      onwarn: (warning, warn) => {
        // Ignore the 'this' at the top level warning
        if (warning.code === 'THIS_IS_UNDEFINED') {
          return
        }
        // Show all other warnings
        warn(warning)
      },
    }

    const outputOptions = {
      file: `${path.js}/${outputFilename}`,
      format: 'iife',
      sourcemap: true,
      banner: `
/**
 * Silicon | Multipurpose Bootstrap 5 Template & UI Kit
 * Copyright 2023 Createx Studio
 * Theme scripts
 *
 * @author Createx Studio
 * @version 1.6.0
 */
      `,
    }

    const bundle = await rollup.rollup(inputOptions)
    await bundle.write(outputOptions)

    log.success(`Bundled Vendor-scripts (${output})`)
  } catch (error) {
    log.error('', error.message)
  }
}

const buildVendorScripts = async () => {
  try {
    //await lintJS()
    if (output === 'expanded' || output === 'minified') {
      await bundleVendorJS(output)
    } else {
      log.error('Invalid output key. Use either "minified" or "expanded"')
    }
  } catch (error) {
    log.error('', error.message)
  }
}

buildVendorScripts();
