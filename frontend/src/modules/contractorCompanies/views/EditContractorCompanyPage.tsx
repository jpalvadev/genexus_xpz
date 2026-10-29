import { getRouteApi } from '@tanstack/react-router';

import { UpdateContractorCompanyPage } from '../contractorCompanies.config';

const routeApi = getRouteApi('/_layout/contractorCompanies/$id/edit');

/** Route adapter: the loader lives in the route file; the produced UpdatePage
 *  stays presentational and receives the record as a prop. */
export default function EditContractorCompanyPage() {
    return <UpdateContractorCompanyPage initialData={routeApi.useLoaderData()} />;
}
