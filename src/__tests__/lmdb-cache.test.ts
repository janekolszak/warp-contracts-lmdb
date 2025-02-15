import { LmdbCache } from '../LmdbCache';
import { defaultCacheOptions } from 'warp-contracts';
import * as fs from 'fs';

describe('Lmdb cache', () => {
  beforeAll(() => {
    if (fs.existsSync('./cache')) {
      fs.rmSync('./cache', { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync('./cache')) {
      fs.rmSync('./cache', { recursive: true });
    }
  });

  it('should return proper data', async () => {
    const sut = new LmdbCache<any>({ ...defaultCacheOptions, inMemory: true });

    await sut.put(
      {
        contractTxId: 'contract0',
        sortKey: '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      },
      { result: 'contract0:sortKey0' }
    );
    await sut.put(
      {
        contractTxId: 'contract1',
        sortKey: '000000860513,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      },
      { result: 'contract1:sortKey1' }
    );
    await sut.put(
      {
        contractTxId: 'contract1',
        sortKey: '000000860514,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      },
      { result: 'contract1:sortKey2' }
    );
    await sut.put(
      {
        contractTxId: 'contract1',
        sortKey: '000000860515,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      },
      { result: 'contract1:sortKey3' }
    );
    await sut.put(
      {
        contractTxId: 'contract2',
        sortKey: '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      },
      { result: 'contract2:sortKey1' }
    );

    expect(
      await sut.get(
        'contract2',
        '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual({
      sortKey: '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract2:sortKey1' }
    });
    expect(
      await sut.get(
        'contract1',
        '000000860514,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual({
      sortKey: '000000860514,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract1:sortKey2' }
    });
    expect(
      await sut.get(
        'contract0',
        '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual({
      sortKey: '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract0:sortKey0' }
    });
    expect(
      await sut.get(
        'contract0',
        '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b766'
      )
    ).toEqual(null);
    expect(
      await sut.get(
        'contract2',
        '000000860514,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual(null);
    expect(
      await sut.get(
        'contract1',
        '000000860516,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual(null);

    expect(
      await sut.getLessOrEqual(
        'contract2',
        '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual({
      sortKey: '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract2:sortKey1' }
    });
    expect(
      await sut.getLessOrEqual(
        'contract2',
        '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b768'
      )
    ).toEqual({
      sortKey: '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract2:sortKey1' }
    });
    expect(
      await sut.getLessOrEqual(
        'contract2',
        '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b766'
      )
    ).toEqual(null);

    expect(
      await sut.getLessOrEqual(
        'contract1',
        '000000860513,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual({
      sortKey: '000000860513,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract1:sortKey1' }
    });

    expect(
      await sut.getLessOrEqual(
        'contract1',
        '000000860513,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b766'
      )
    ).toEqual(null);
    expect(
      await sut.getLessOrEqual(
        'contract0',
        '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b768'
      )
    ).toEqual({
      sortKey: '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract0:sortKey0' }
    });
    expect(
      await sut.getLessOrEqual(
        'contract0',
        '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual({
      sortKey: '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract0:sortKey0' }
    });
    expect(
      await sut.getLessOrEqual(
        'contract0',
        '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b765'
      )
    ).toEqual(null);
  });
});
