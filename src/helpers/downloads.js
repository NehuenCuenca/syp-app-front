import { useAuthStore } from "@/stores/auth";


export const createTemporalLink = ({ blob, filename = '' }) => { 
    // Crear un enlace para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;

    // get filename from content-disposition header if exists
    (filename.length>0)
      ? link.setAttribute('download', filename)
      : link.setAttribute('download', `syp_app_archivo_${Date.now()}.xlsx`);

    document.body.appendChild(link);
    link.click();
    link.remove();    
}

const authStore = useAuthStore()

export const getAxiosConfigForBlobResponse = () => ({
    responseType: 'blob', // Importante para manejar archivos binarios
    headers: {
    'Authorization': `Bearer ${authStore.token}`,
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
}) 