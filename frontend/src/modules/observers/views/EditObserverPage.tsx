import { getRouteApi } from '@tanstack/react-router';

import { UpdateObserverPage } from '../observers.config';

const routeApi = getRouteApi('/_layout/observers/$id/edit');

/** Route adapter: the loader lives in the route file; the produced UpdatePage
 *  stays presentational and receives the record as a prop. */
export default function EditObserverPage() {
    return <UpdateObserverPage initialData={routeApi.useLoaderData()} />;
}
