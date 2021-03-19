import React, { useEffect, useState } from 'react';
import './style.scss';
import { CurrencyIcon } from '../icons';
import { IonInput } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { fromSatoshi, fromSatoshiFixed } from '../../utils/helpers';
import { updateRates } from '../../redux/actions/ratesActions';

interface WithdrawRowInterface {
  balance: BalanceInterface;
  price: number | undefined;
  onAmountChange: (amount: number | undefined) => void;
  inputAmount: number;
}

const WithdrawRow: React.FC<WithdrawRowInterface> = ({
  balance,
  price,
  onAmountChange,
  inputAmount,
}) => {
  const currency = useSelector((state: any) => state.settings.currency);
  const [residualBalance, setResidualBalance] = useState<string>(
    fromSatoshiFixed(balance.amount, balance.precision, balance.precision)
  );
  const [fiat, setFiat] = useState<string>('0.00');

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateRates());
  }, []);

  const reset = () => {
    setResidualBalance(
      fromSatoshiFixed(balance.amount, balance.precision, balance.precision)
    );
    if (price) setFiat('0.00');
    onAmountChange(undefined);
  };

  const handleAmountChange = (value: string | undefined | null) => {
    if (!value) {
      reset();
      return;
    }

    const val = parseFloat(value);
    const residualAmount = fromSatoshi(balance.amount, balance.precision) - val;
    setResidualBalance(
      residualAmount.toLocaleString(undefined, {
        maximumFractionDigits: balance.precision,
      })
    );
    if (price) setFiat((val * price).toFixed(2));
    onAmountChange(val);
  };

  return (
    <div className="exchange-coin-container">
      <div className="exchanger-row">
        <div className="coin-name">
          <span className="icon-wrapper medium">
            <CurrencyIcon currency={balance.ticker} />
          </span>
          <p>{balance.ticker.toUpperCase()}</p>
        </div>
        <div className="ion-text-end">
          <IonInput
            type="number"
            value={inputAmount || ''}
            placeholder="0.00"
            className="amount-input"
            autofocus={true}
            required={true}
            onIonChange={(e) => handleAmountChange(e.detail.value)}
          />
        </div>
      </div>
      <div className="exchanger-row sub-row">
        <div>
          <p>
            Residual balance: {residualBalance ? residualBalance : ''}{' '}
            {balance.ticker.toUpperCase()}{' '}
          </p>
        </div>
        <div>
          {price && (
            <p>
              {fiat} {currency && currency.toUpperCase()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawRow;
