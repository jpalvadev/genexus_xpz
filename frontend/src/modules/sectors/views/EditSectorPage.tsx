import { getRouteApi } from '@tanstack/react-router';

import { UpdateSectorPage } from '../sector.config';

const routeApi = getRouteApi('/_layout/sectors/$id/edit');

/** Route adapter: the loader lives in the route file; the produced UpdatePage
 *  stays presentational and receives the record as a prop. */
export default function EditSectorPage() {
    return <UpdateSectorPage initialData={routeApi.useLoaderData()} />;
}
