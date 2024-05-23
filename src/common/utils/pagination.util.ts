import { PaginationDto } from "../dtos/index.dto";

export function paginationSolver(paginationDto: PaginationDto) {
    let { page = 0, limit = 10 } = paginationDto;
    page = page == 0 ? 0 : page - 1;
    const skip = page * limit;
    return {
        limit,
        page,
        skip,
    }
}

export function paginationGenerator(page: number = 0, limit: number = 0, count: number = 0) {
    return {
        page,
        limit,
        totalCount: count,
        totalPage: (Math.ceil(count / limit)),
    }
}