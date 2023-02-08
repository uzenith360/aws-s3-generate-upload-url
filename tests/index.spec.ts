import 'mocha';
import { assert } from 'chai';

import AWSS3GenerateUploadURL from '../src/index';

describe('AWSS3GenerateUploadURL Class', () => {
    it('should have a getInstance init method', () => {
        assert.isFunction(AWSS3GenerateUploadURL.getInstance);
    });
});