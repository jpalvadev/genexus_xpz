import { getRouteApi } from '@tanstack/react-router';

import { UpdateComboOptionPage } from '../comboOptions.config';

const routeApi = getRouteApi('/_layout/comboOptions/$id/edit');

/** Route adapter: the loader lives in the route file; the produced UpdatePage
 *  stays presentational and receives the record as a prop. */
export default function EditComboOptionPage() {
    return <UpdateComboOptionPage initialData={routeApi.useLoaderData()} />;
}
