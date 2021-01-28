/** @format */

import { Card, message, Switch } from 'antd';
import { isUndefined } from 'lodash';
import React, { useEffect, useState } from 'react';
import { setMultiLanguage, store } from '../../../Store/ReduxStore';

interface Props {}

const Multilanguage: React.FunctionComponent<Props> = (props) => {
	const { current } = store.getState() as G14Config;
	const [multilang, setMultilang] = useState<undefined | boolean>(undefined);
	useEffect(() => {
		if (isUndefined(multilang)) return;
		store.dispatch(setMultiLanguage(multilang));
	}, [multilang]);

	return (
		<Card title="Beta MultiLanguage Support">
			<Switch
				checked={
					isUndefined(multilang) ? current.newLanguageSupport : multilang
				}
				onChange={(e, evt) => {
					message.warning('Restart the application for change to take effect.');

					setMultilang(e);
				}}
			/>
		</Card>
	);
};

export default Multilanguage;
